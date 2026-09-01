import os
import certifi
import pandas as pd
from urllib.parse import quote_plus
from pymongo import MongoClient
from dotenv import load_dotenv
from datasets import Dataset
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer
)

load_dotenv()


def main():
    # 1. MongoDB Connection
    RAW_PASSWORD = "nGQPusm8MVQ6A8SU"
    encoded_password = quote_plus(RAW_PASSWORD)
    DEFAULT_URI = f"mongodb+srv://admin:{encoded_password}@careeradvisor.f6oqcen.mongodb.net/?retryWrites=true&w=majority&appName=CareerAdvisor"
    ATLAS_URI = os.getenv("MONGODB_URI", DEFAULT_URI)

    DB_NAME = "CareerAdvisor"
    COLLECTION_NAME = "vector_embeddings"

    print("Fetching training data from MongoDB Atlas...")
    client = MongoClient(ATLAS_URI, tlsCAFile=certifi.where())
    collection = client[DB_NAME][COLLECTION_NAME]

    # 2. Extract Data
    documents = list(collection.find({}, {"_id": 0, "text": 1, "metadata": 1}))
    if not documents:
        print("[Warning] No documents found in MongoDB collection. Exiting training.")
        return

    df = pd.DataFrame(documents)

    if "metadata" in df.columns:
        metadata_df = pd.json_normalize(df["metadata"])
        df = pd.concat([df.drop(columns=["metadata"]), metadata_df], axis=1)

    # Fallback/cleaning for 'label' column
    if "label" not in df.columns:
        df["label"] = 0

    df = df.dropna(subset=["text", "label"])
    df["label"] = df["label"].astype(int)

    num_labels = len(df["label"].unique())
    if num_labels < 2:
        print(f"[Info] Found {len(df)} documents with {num_labels} distinct label. Sequence classification fine-tuning requires at least 2 distinct classes. Add labeled metadata to MongoDB documents to fine-tune classifier.")
        return

    # 3. Convert & Split Dataset
    hf_dataset = Dataset.from_pandas(df[["text", "label"]])
    hf_dataset = hf_dataset.map(lambda x: {"label": int(x["label"])})
    
    # Train / Eval Split (80% Train, 20% Eval)
    dataset_split = hf_dataset.train_test_split(test_size=0.2)
    train_dataset = dataset_split["train"]
    eval_dataset = dataset_split["test"]

    # 4. Tokenization
    MODEL_NAME = "bert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            padding="max_length",
            truncation=True,
            max_length=512
        )

    print("Tokenizing datasets...")
    tokenized_train = train_dataset.map(tokenize_function, batched=True)
    tokenized_eval = eval_dataset.map(tokenize_function, batched=True)

    # 5. Initialize Model & Training Arguments
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=num_labels
    )

    training_args = TrainingArguments(
        output_dir="./results",
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=3,
        weight_decay=0.01,
        load_best_model_at_end=True,
        report_to="none"
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_eval,
        processing_class=tokenizer
    )

    # 6. Train and Save
    print("Starting model fine-tuning...")
    trainer.train()

    SAVE_PATH = "./fine_tuned_model"
    model.save_pretrained(SAVE_PATH)
    tokenizer.save_pretrained(SAVE_PATH)
    print(f"✅ Training complete! Fine-tuned model saved to '{SAVE_PATH}'.")


if __name__ == "__main__":
    main()
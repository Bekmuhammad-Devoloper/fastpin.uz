package main

import (
	"demo/almaz/internal/transactions"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func migrateTransactionStatus() {
	err := godotenv.Load(".env")
	if err != nil {
		panic(err)
	}
	db, err := gorm.Open(postgres.Open(os.Getenv("DSN")), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	result := db.Model(&transactions.Transaction{}).
		Where("status IS NULL OR status = ''").
		Update("status", "pending")

	if result.Error != nil {
		panic(result.Error)
	}

	println("Updated", result.RowsAffected, "transactions with status = pending")
}

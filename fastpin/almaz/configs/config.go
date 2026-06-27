package configs

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Db                   DbConfig
	Auth                 AuthConfig
	Token                TokenConfig
	JWTSecret            string
	TelegramIngestSecret string
	BotToken             string
	TelegramAdmins       []int64
}
type DbConfig struct {
	Dsn string
}
type AuthConfig struct {
	Auth string
}
type TokenConfig struct {
	AdminToken string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("error with loading config")
	}
	return &Config{
		Db: DbConfig{
			Dsn: os.Getenv("DSN"),
		},
		Auth: AuthConfig{
			os.Getenv("AUTH"),
		},
		Token: TokenConfig{
			os.Getenv("ADMINTOKEN"),
		},
		JWTSecret:            os.Getenv("JWT_SECRET"),
		TelegramIngestSecret: os.Getenv("TELEGRAM_INGEST_SECRET"),
		BotToken:             os.Getenv("BOT_TOKEN"),
		TelegramAdmins:       parseAdmins(os.Getenv("TELEGRAM_ADMINS")),
	}
}

// parseAdmins turns a comma-separated list of chat IDs ("123,456") into []int64,
// silently skipping blanks and non-numeric entries.
func parseAdmins(s string) []int64 {
	var out []int64
	for _, part := range strings.Split(s, ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		if id, err := strconv.ParseInt(part, 10, 64); err == nil {
			out = append(out, id)
		}
	}
	return out
}

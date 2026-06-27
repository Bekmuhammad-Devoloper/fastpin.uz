package payment

import (
	"demo/almaz/configs"
	"demo/almaz/internal/auth"
	"demo/almaz/pkg/db"
	"net/http"
	"time"
)

type PaymentRepository struct {
	DataBase *db.Db
}

type PaymentRepositoryDeps struct {
	DataBase *db.Db
}

type User struct {
	Login    string `gorm:"unique" json:"login"`
	Password string `json:"password"`
	Token    string `json:"token"`
	Balance  int    `json:"balance"`
}
type Transaction struct {
	Id        string `json:"id"`
	UserId    string `json:"userId"`
	Price     int    `json:"price"`
	Year      int    `json:"year"`
	Month     int    `json:"month"`
	Day       int    `json:"day"`
	Hour      int    `json:"hour"`
	Minute    int    `json:"minute"`
	GameName  string `json:"gameName"`
	DonatName string `json:"donatName"`
	CreatedBy string `json:"createdBy"`
	Order     string `json:"order"`
	Status    string `json:"status"`
	PaymentId string `json:"paymentId" gorm:"index"`
}
type PaymentHandler struct {
	*configs.Config
	PaymentRepository PaymentRepository
	AuthHandler       *auth.AuthHandler
}

type PaymenthandlerDeps struct {
	*configs.Config
	PaymentRepository *PaymentRepository
	AuthHandler       *auth.AuthHandler
	AuthMW            func(http.Handler) http.Handler
	AdminMW           func(http.Handler) http.Handler
}
type Payment struct {
	Id        string `json:"id" gorm:"primaryKey"`
	Year      int    `json:"year"`
	Month     int    `json:"month"`
	Day       int    `json:"day"`
	Hour      int    `json:"hour"`
	Minute    int    `json:"minute"`
	UserId    string `json:"userId" gorm:"index"`
	Price     int    `json:"price"`
	IsWorking bool   `json:"isWorking" gorm:"index"`
	Sender    string `json:"sender"` 
}
type createPaymentRequest struct {
	UserId    string `json:"userId"`
	Price     int    `json:"price"`
	IsWorking bool   `json:"isWorking"`
}
type updatePaymentRequest struct {
	Token     string `json:"token"`
	Id        string `json:"id"`
	IsWorking bool   `json:"isWorking"`
	UserId    string `json:"userId"`
}
type deletePaymentRequest struct {
	Token string `json:"token"`
	Id    string `json:"id"`
}
type getPaymentRequest struct {
	Token string `json:"token"`
}
type createPaymentTelegram struct {
	Amount     int    `json:"amount"`
	Sender     string `json:"sender"`
	Year       int    `json:"year"`
	Month      int    `json:"month"`
	Day        int    `json:"day"`
	Hour       int    `json:"hour"`
	Minute     int    `json:"minute"`
	CardNumber string `json:"cardNumber"`
}

func isExpired(p Payment) bool {
	loc := time.FixedZone("UZT", 5*60*60)
	created := time.Date(
		p.Year,
		time.Month(p.Month),
		p.Day,
		p.Hour,
		p.Minute,
		0,
		0,
		loc,
	)
	return time.Since(created) >= 6*time.Minute
}

type getPaymentByPeriodRequest struct {
	Token      string `json:"token"`
	StartDay   int    `json:"startDay"`
	StartMonth int    `json:"startMonth"`
	StartYear  int    `json:"startYear"`
	EndDay     int    `json:"endDay"`
	EndMonth   int    `json:"endMonth"`
	EndYear    int    `json:"endYear"`
}

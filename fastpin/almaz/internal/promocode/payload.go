package promocode

import (
	"demo/almaz/configs"
	"demo/almaz/internal/auth"
	"demo/almaz/pkg/db"
	"net/http"
	"time"
)

type PromocodeRepository struct {
	DataBase *db.Db
}

type PromocodehandlerDeps struct {
	DataBase *db.Db
}
type PromocodeHandler struct {
	Config              *configs.Config
	PromocodeRepository *PromocodeRepository
	AuthHandler         *auth.AuthHandler
}
type PromocodeshandlerDeps struct {
	*configs.Config
	PromocodeRepository *PromocodeRepository
	AuthHandler         *auth.AuthHandler
	AdminMW             func(http.Handler) http.Handler
}

type PromoCode struct {
	Id           string    `json:"id" gorm:"primaryKey"`
	Code         string    `json:"code" gorm:"uniqueIndex"`
	ExpiresAt    time.Time `json:"expiresAt"`
	UsageLimit   int       `json:"usageLimit"` 
	UsedCount    int       `json:"usedCount"`
	UsagePerUser int       `json:"usagePerUser"` 
	DiscountType string    `json:"discountType"` 
	Discount     int       `json:"discount"`
	MaxDiscount  int       `json:"maxDiscount"` 
	MinPrice     int       `json:"minPrice"`    
	IsActive     bool      `json:"isActive"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreatePromocodeRequest struct {
	Token        string    `json:"token"`
	Code         string    `json:"code"`
	ExpiresAt    time.Time `json:"expiresAt"`
	UsageLimit   int       `json:"usageLimit"`
	UsagePerUser int       `json:"usagePerUser"`
	DiscountType string    `json:"discountType"`
	Discount     int       `json:"discount"`
	MaxDiscount  int       `json:"maxDiscount"`
	MinPrice     int       `json:"minPrice"`
}

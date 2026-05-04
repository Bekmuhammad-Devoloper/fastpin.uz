package promocode

import (
	"demo/almaz/pkg/db"
	"demo/almaz/pkg/req"
	"demo/almaz/pkg/res"
	"demo/almaz/pkg/token"
	"net/http"
	"time"
)

func NewPromocodesRepository(dataBase *db.Db) *PromocodeRepository {
	return &PromocodeRepository{
		DataBase: dataBase,
	}
}

func NewPromocodeHandler(router *http.ServeMux, deps *PromocodeshandlerDeps) *PromocodeHandler {
	handler := &PromocodeHandler{
		Config:              deps.Config,
		PromocodeRepository: deps.PromocodeRepository,
		AuthHandler:         deps.AuthHandler,
	}

	router.Handle("/promocode/create", deps.AdminMW(http.HandlerFunc(handler.create())))
	router.Handle("/promocode/get", deps.AdminMW(http.HandlerFunc(handler.get())))
	router.Handle("/promocode/update", deps.AdminMW(http.HandlerFunc(handler.update())))
	router.Handle("/promocode/delete", deps.AdminMW(http.HandlerFunc(handler.delete())))

	return handler
}


func (handler *PromocodeHandler) create() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[CreatePromocodeRequest](&w, r)
		if err != nil {
			res.Json(w, err.Error(), 400)
			return
		}

		if body.DiscountType != "percent" && body.DiscountType != "fixed" {
			res.Json(w, "invalid discount type", 400)
			return
		}

		promo := PromoCode{
			Id:           token.CreateId(),
			Code:         body.Code,
			ExpiresAt:    body.ExpiresAt,
			UsageLimit:   body.UsageLimit,
			UsagePerUser: body.UsagePerUser,
			UsedCount:    0,
			DiscountType: body.DiscountType,
			Discount:     body.Discount,
			MaxDiscount:  body.MaxDiscount,
			MinPrice:     body.MinPrice,
			IsActive:     true,
		}

		result := handler.PromocodeRepository.DataBase.Create(&promo)
		if result.Error != nil {
			res.Json(w, result.Error.Error(), 500)
			return
		}

		res.Json(w, promo, 200)
	}
}


func (handler *PromocodeHandler) get() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Query().Get("id")
		if id == "" {
			var promos []PromoCode
			if err := handler.PromocodeRepository.DataBase.Find(&promos); err != nil {
				res.Json(w, "db error", 500)
				return
			}
			res.Json(w, promos, 200)
			return
		}

		var promo PromoCode
		if err := handler.PromocodeRepository.DataBase.First(&promo, "id = ?", id); err != nil {
			res.Json(w, "promocode not found", 404)
			return
		}

		res.Json(w, promo, 200)
	}
}


type UpdatePromocodeRequest struct {
	ExpiresAt    *time.Time `json:"expiresAt"`
	UsageLimit   *int       `json:"usageLimit"`
	UsagePerUser *int       `json:"usagePerUser"`
	IsActive     *bool      `json:"isActive"`
}

func (handler *PromocodeHandler) update() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Query().Get("id")
		if id == "" {
			res.Json(w, "id required", 400)
			return
		}

		body, err := req.HandleBody[UpdatePromocodeRequest](&w, r)
		if err != nil {
			return
		}

		var promo PromoCode
		if err := handler.PromocodeRepository.DataBase.First(&promo, "id = ?", id); err != nil {
			res.Json(w, "promocode not found", 404)
			return
		}

		if body.ExpiresAt != nil {
			promo.ExpiresAt = *body.ExpiresAt
		}
		if body.UsageLimit != nil {
			promo.UsageLimit = *body.UsageLimit
		}
		if body.UsagePerUser != nil {
			promo.UsagePerUser = *body.UsagePerUser
		}
		if body.IsActive != nil {
			promo.IsActive = *body.IsActive
		}

		if err := handler.PromocodeRepository.DataBase.Save(&promo); err != nil {
			res.Json(w, "db error", 500)
			return
		}

		res.Json(w, promo, 200)
	}
}


func (handler *PromocodeHandler) delete() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Query().Get("id")
		if id == "" {
			res.Json(w, "id required", 400)
			return
		}

		result := handler.PromocodeRepository.DataBase.Delete(&PromoCode{}, "id = ?", id)
		if result.Error != nil {
			res.Json(w, "db error", 500)
			return
		}
		if result.RowsAffected == 0 {
			res.Json(w, "promocode not found", 404)
			return
		}

		res.Json(w, "promocode deleted", 200)
	}
}


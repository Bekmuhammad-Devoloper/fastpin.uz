package buy

import (
	"demo/almaz/internal/auth"
	"demo/almaz/pkg/db"
	"demo/almaz/pkg/middleware"
	"demo/almaz/pkg/req"
	"demo/almaz/pkg/res"
	"demo/almaz/pkg/token"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"gorm.io/gorm"
)

const USD_TO_SUM = 12500
const TON_TO_SUM = 65000

func NewBuyRepository(dataBase *db.Db) *BuyRepository {
	return &BuyRepository{
		DataBase: dataBase,
	}
}
func NewGamesHandler(router *http.ServeMux, deps *BuyhandlerDeps) *BuyHandler {
	registry := NewProviderRegistry()
	registry.Register("b2bulk", &BulkProvider{
		ApiURL: os.Getenv("BULKAPI"),
		ApiKey: os.Getenv("BULKKEY"),
	})
	registry.Register("istar", &FragmentProvider{
		ApiURL: os.Getenv("ISTARAPI"),
		ApiKey: os.Getenv("ISTARKEY"),
	})
	handler := &BuyHandler{
		Config:        deps.Config,
		BuyRepository: *deps.BuyRepository,
		AuthHandler:   deps.AuthHandler,
		Registry:      registry,
	}
	router.Handle("/buy/create", deps.AuthMW(http.HandlerFunc(handler.create())))
	router.HandleFunc("/buy/orderStatus", handler.orderStatus())
	router.HandleFunc("/buy/ordersStatus", handler.ordersStatus())
	router.Handle("/buy/getBalance", deps.AdminMW(http.HandlerFunc(handler.getBalance())))
	router.HandleFunc("/buy/webhook/fragment", handler.fragmentWebhook())
	return handler
}

func (handler *BuyHandler) create() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[createBuyRequest](&w, r)
		if err != nil {
			res.Json(w, "bad request", 400)
			return
		}
		user, ok := middleware.UserFromContext(r.Context())
		if !ok {
			res.Json(w, "unauthorized", 401)
			return
		}
		var offer Offers
		if err := handler.BuyRepository.DataBase.
			Where("id = ?", body.OfferId).
			First(&offer).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				res.Json(w, "offer не найдено", 404)
				return
			}
			res.Json(w, "ошибка базы данных", 500)
			return
		}
		var offerPrice int
		if user.UserRole == "superUser" {
			offerPrice, err = strconv.Atoi(offer.SuperPrice)
		} else {
			offerPrice, err = strconv.Atoi(offer.Price)
		}
		if err != nil || offerPrice <= 0 {
			res.Json(w, "некорректная цена", 400)
			return
		}
		var game Games
		if err := handler.BuyRepository.DataBase.
			Where("id = ?", body.GameId).
			First(&game).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				res.Json(w, "игра не найдена", 404)
				return
			}
			res.Json(w, "ошибка при получении игры", 500)
			return
		}
		botIdNumber, err := strconv.Atoi(body.BotId)
		if err != nil {
			res.Json(w, "некорректный bot id", 400)
			return
		}
		providerKey := GameProviders[game.Name]
		provider, ok := handler.Registry.Get(providerKey)
		if !ok {
			res.Json(w, fmt.Sprintf("провайдер не найден: game.Name=%q, providerKey=%q", game.Name, providerKey), 400)
			return
		}
		link := body.PlayerId
		if game.Description == "two" {
			if body.ServerId == "" {
				res.Json(w, "не указан server id", 400)
				return
			}
			link = body.PlayerId + "|" + body.ServerId
		}
		balanceStr, _, err := provider.GetBalance()
		if err != nil {
			res.Json(w, err.Error(), 500)
			return
		}
		providerBalanceRaw, err := strconv.ParseFloat(balanceStr, 64)
		if err != nil {
			res.Json(w, err.Error(), 500)
			return
		}
		var providerBalanceSom float64
		if game.Name == "Telegram" {
			providerBalanceSom = providerBalanceRaw * TON_TO_SUM
		} else {
			providerBalanceSom = providerBalanceRaw * USD_TO_SUM
		}
		offerPriceFloat := float64(offerPrice)
		if providerBalanceSom < offerPriceFloat {
			res.Json(w, "недостаточно средств у провайдера", 400)
			return
		}
		if providerBalanceSom-offerPriceFloat < 100000 {
			res.Json(w, "баланс провайдера ниже допустимого порога", 400)
			return
		}
		err = handler.BuyRepository.DataBase.Transaction(func(tx *gorm.DB) error {
			return handler.AuthHandler.DecreaseBalance(tx, user.Token, offerPrice)
		})
		if err != nil {
			if err.Error() == "недостаточно средств" {
				res.Json(w, map[string]string{
					"error": "Недостаточно средств на балансе",
				}, 400)
				return
			}
			if err.Error() == "пользователь не найден" {
				res.Json(w, map[string]string{
					"error": "Пользователь не найден",
				}, 404)
				return
			}
			res.Json(w, "ошибка базы данных", 500)
			return
		}

		orderId, err := provider.CreateOrder(botIdNumber, link)
		if err != nil {
			if _, refundErr := handler.AuthHandler.UpdateBalance(user.Token, offerPrice); refundErr != nil {
				fmt.Println("[BUY] CRITICAL: order failed AND refund failed, user:", user.Token, "amount:", offerPrice, "err:", refundErr)
			}
			res.Json(w, err.Error(), 500)
			return
		}

		loc := time.FixedZone("UZT", 5*60*60)
		now := time.Now().In(loc)
		txRecord := Transaction{
			Id:        token.CreateId(),
			UserId:    user.Token,
			Price:     -offerPrice,
			Year:      now.Year(),
			Month:     int(now.Month()),
			Day:       now.Day(),
			Hour:      now.Hour(),
			Minute:    now.Minute(),
			GameName:  game.Name,
			DonatName: offer.UzName,
			CreatedBy: body.BotId,
			Order:     orderId,
			Status:    "pending",
			PlayerId:  body.PlayerId,
			ServerId:  body.ServerId,
		}
		if err := handler.BuyRepository.DataBase.Create(&txRecord).Error; err != nil {
			fmt.Println("[BUY] ошибка записи транзакции, order:", orderId, "err:", err)
		}
		res.Json(w, map[string]string{
			"order":   orderId,
			"message": "Покупка успешно выполнена",
		}, 200)
	}
}
func (handler *BuyHandler) processRefund(order string) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("[REFUND PANIC]", order, r)
		}
	}()

	fmt.Println("[REFUND] начало обработки order:", order)

	var transaction Transaction
	if err := handler.BuyRepository.DataBase.
		Where("\"order\" = ?", order).
		First(&transaction).Error; err != nil {
		fmt.Println("[REFUND] транзакция не найдена для order:", order, "err:", err)
		return
	}

	botId := transaction.CreatedBy
	fmt.Println("[REFUND] найдена транзакция, userId:", transaction.UserId, "price:", transaction.Price, "botId:", botId)

	var existingRefund Refund
	if err := handler.BuyRepository.DataBase.
		Where("\"order\" = ? AND bot_id = ?", order, botId).
		First(&existingRefund).Error; err == nil {
		fmt.Println("[REFUND] уже обработан order:", order)
		return
	}

	refundAmount := -transaction.Price
	if refundAmount <= 0 {
		fmt.Println("[REFUND] некорректная сумма возврата:", refundAmount, "order:", order)
		return
	}

	loc := time.FixedZone("UZT", 5*60*60)
	now := time.Now().In(loc)

	err := handler.BuyRepository.DataBase.Transaction(func(tx *gorm.DB) error {
		refund := Refund{
			Id:     token.CreateId(),
			Order:  order,
			BotId:  botId,
			UserId: transaction.UserId,
			Price:  refundAmount,
			Year:   now.Year(),
			Month:  int(now.Month()),
			Day:    now.Day(),
		}
		if err := tx.Create(&refund).Error; err != nil {
			return fmt.Errorf("create refund: %w", err)
		}

		if err := tx.
			Model(&auth.User{}).
			Where("token = ?", transaction.UserId).
			Update("balance", gorm.Expr("balance + ?", refundAmount)).Error; err != nil {
			return fmt.Errorf("update balance: %w", err)
		}
		if err := tx.Model(&Transaction{}).
			Where("id = ?", transaction.Id).
			Update("status", "failed").Error; err != nil {
			return fmt.Errorf("update tx status: %w", err)
		}

		refundTx := Transaction{
			Id:        token.CreateId(),
			UserId:    transaction.UserId,
			Price:     refundAmount,
			Year:      now.Year(),
			Month:     int(now.Month()),
			Day:       now.Day(),
			Hour:      now.Hour(),
			Minute:    now.Minute(),
			GameName:  transaction.GameName,
			DonatName: transaction.DonatName,
			CreatedBy: "refund",
			Order:     order,
			Status:    "completed",
			PlayerId:  "-",
			ServerId:  "-",
		}
		if err := tx.Create(&refundTx).Error; err != nil {
			return fmt.Errorf("create refund tx: %w", err)
		}
		return nil
	})

	if err != nil {
		fmt.Println("[REFUND] ОШИБКА order:", order, "err:", err)
	} else {
		fmt.Println("[REFUND] УСПЕХ order:", order, "возвращено:", refundAmount)
	}
}

func (handler *BuyHandler) orderStatus() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[OrderStatusRequest](&w, r)
		if err != nil {
			res.Json(w, "bad request", http.StatusBadRequest)
			return
		}

		var game Games
		if err := handler.BuyRepository.DataBase.
			Where("id = ?", body.GameId).
			First(&game).Error; err != nil {

			if errors.Is(err, gorm.ErrRecordNotFound) {
				res.Json(w, "игра не найдена", http.StatusNotFound)
				return
			}
			res.Json(w, "ошибка при получении игры", http.StatusInternalServerError)
			return
		}
		if game.Name == "Telegram" {
			var tx Transaction
			if err := handler.BuyRepository.DataBase.
				Where("\"order\" = ? AND price < 0", body.Order).
				First(&tx).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					res.Json(w, "заказ не найден", http.StatusNotFound)
					return
				}
				res.Json(w, "ошибка базы данных", http.StatusInternalServerError)
				return
			}
			res.Json(w, &OrderStatusResponse{Status: tx.Status}, http.StatusOK)
			if tx.Status == "failed" {
				go handler.processRefund(body.Order)
			}
			return
		}

		provider, ok := handler.Registry.Get(GameProviders[game.Name])
		if !ok {
			res.Json(w, "провайдер игры не поддерживается", http.StatusBadRequest)
			return
		}
		status, err := provider.OrderStatus(body.Order)
		if err != nil {
			res.Json(w, err.Error(), http.StatusBadGateway)
			return
		}
		res.Json(w, status, http.StatusOK)
		switch status.Status {
		case "Completed", "Partial":
			handler.BuyRepository.DataBase.Model(&Transaction{}).
				Where("\"order\" = ? AND price < 0", body.Order).
				Update("status", "completed")
		case "Canceled", "Refunded":
			go handler.processRefund(body.Order)
		}
	}
}

func (handler *BuyHandler) ordersStatus() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := req.HandleBody[OrdersStatusRequest](&w, r)
		if err != nil {
			res.Json(w, "bad request", http.StatusBadRequest)
			return
		}
		if len(body.Orders) == 0 {
			res.Json(w, "orders list is empty", http.StatusBadRequest)
			return
		}
		var game Games
		if err := handler.BuyRepository.DataBase.
			Where("id = ?", body.GameId).
			First(&game).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				res.Json(w, "игра не найдена", http.StatusNotFound)
				return
			}
			res.Json(w, "ошибка при получении игры", http.StatusInternalServerError)
			return
		}
		provider, ok := handler.Registry.Get(GameProviders[game.Name])
		if !ok {
			res.Json(w, "провайдер игры не поддерживается", http.StatusBadRequest)
			return
		}
		statuses, err := provider.OrdersStatus(body.Orders)
		if err != nil {
			res.Json(w, err.Error(), http.StatusBadGateway)
			return
		}
		res.Json(w, statuses, http.StatusOK)
		for orderId, s := range *statuses {
			if s.Status == "Canceled" || s.Status == "Refunded" {
				go handler.processRefund(orderId)
			} else if s.Status == "Completed" || s.Status == "Partial" {
				orderIdCopy := orderId
				go handler.BuyRepository.DataBase.Model(&Transaction{}).
					Where("\"order\" = ? AND price < 0", orderIdCopy).
					Update("status", "completed")
			}
		}
	}
}

func (handler *BuyHandler) getBalance() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		balances := make(map[string]string)
		for name, provider := range handler.Registry.All() {
			balanceStr, _, err := provider.GetBalance()
			if err != nil {
				balances[name] = "error: " + err.Error()
			} else {
				balances[name] = balanceStr
			}
		}
		res.Json(w, balances, 200)
	}
}

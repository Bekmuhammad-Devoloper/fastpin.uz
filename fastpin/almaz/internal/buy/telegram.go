package buy

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"demo/almaz/pkg/res"
)


type FragmentProvider struct {
	ApiURL string
	ApiKey string
}

type fragmentWalletResponse struct {
	Balance  float64 `json:"balance"`
	Currency string  `json:"currency"`
}

type fragmentRecipientResponse struct {
	Success   bool   `json:"success"`
	Recipient string `json:"recipient"`
}

type fragmentOrderResponse struct {
	OrderId string `json:"order_id"`
	Status  string `json:"status"`
	Error   string `json:"error,omitempty"`
}

type FragmentWebhookPayload struct {
	EventType  string        `json:"event_type"`  
	OccurredAt string        `json:"occurred_at"`
	Order      FragmentOrder `json:"order"`
	Error      string        `json:"error,omitempty"`
	RetryCount int           `json:"retry_count,omitempty"`
	MaxRetries int           `json:"max_retries,omitempty"`
}

type FragmentOrder struct {
	Id        string  `json:"id"`
	Status    string  `json:"status"`
	OrderType string  `json:"order_type"` 
	Amount    float64 `json:"amount"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

func (f *FragmentProvider) GetBalance() (string, string, error) {
	req, err := http.NewRequest(http.MethodGet, f.ApiURL+"/api/v1/partner/wallet/balance", nil)
	if err != nil {
		return "", "", err
	}
	req.Header.Set("API-Key", f.ApiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return "", "", fmt.Errorf("fragment wallet bad status: %d, body: %s", resp.StatusCode, body)
	}

	var result fragmentWalletResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", "", err
	}
	return strconv.FormatFloat(result.Balance, 'f', -1, 64), result.Currency, nil
}

func (f *FragmentProvider) CreateOrder(service int, link string) (string, error) {
	parts := strings.Split(link, "|")
	if len(parts) != 2 {
		return "", fmt.Errorf("fragment: неверный формат link '%s', ожидается 'username|stars' или 'username|premium'", link)
	}
	username := parts[0]
	orderType := parts[1]

	switch orderType {
	case "stars":
		return f.createStarOrder(username, service)
	case "premium":
		return f.createPremiumOrder(username, service)
	default:
		return "", fmt.Errorf("fragment: неизвестный тип заказа '%s' (должен быть 'stars' или 'premium')", orderType)
	}
}

func (f *FragmentProvider) createStarOrder(username string, quantity int) (string, error) {
	if quantity < 50 || quantity > 1_000_000 {
		return "", fmt.Errorf("количество звёзд должно быть от 50 до 1,000,000 (получено: %d)", quantity)
	}

	client := &http.Client{Timeout: 10 * time.Second}

	searchURL := fmt.Sprintf("%s/api/v1/partner/star/recipient/search?username=%s&quantity=%d",
		f.ApiURL, username, quantity)
	req, err := http.NewRequest(http.MethodGet, searchURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("API-Key", f.ApiKey)

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("fragment: ошибка поиска получателя stars: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("fragment: поиск получателя stars (%d): %s", resp.StatusCode, body)
	}

	var recipient fragmentRecipientResponse
	if err := json.NewDecoder(resp.Body).Decode(&recipient); err != nil {
		return "", err
	}
	if !recipient.Success || recipient.Recipient == "" {
		return "", fmt.Errorf("telegram пользователь '%s' не найден", username)
	}
	orderPayload := map[string]interface{}{
		"username":       username,
		"recipient_hash": recipient.Recipient,
		"quantity":       quantity,
		"wallet_type":    "TON",
	}
	jsonBody, err := json.Marshal(orderPayload)
	if err != nil {
		return "", err
	}

	req2, err := http.NewRequest(http.MethodPost, f.ApiURL+"/api/v1/partner/orders/star", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	req2.Header.Set("API-Key", f.ApiKey)
	req2.Header.Set("Content-Type", "application/json")

	resp2, err := client.Do(req2)
	if err != nil {
		return "", err
	}
	defer resp2.Body.Close()

	if resp2.StatusCode >= 400 {
		body, _ := io.ReadAll(resp2.Body)
		return "", fmt.Errorf("fragment: создание star заказа (%d): %s", resp2.StatusCode, body)
	}

	var orderResp fragmentOrderResponse
	if err := json.NewDecoder(resp2.Body).Decode(&orderResp); err != nil {
		return "", err
	}
	if orderResp.Error != "" {
		return "", fmt.Errorf("fragment star order error: %s", orderResp.Error)
	}
	if orderResp.OrderId == "" {
		return "", fmt.Errorf("fragment: order_id не получен")
	}
	return orderResp.OrderId, nil
}

func (f *FragmentProvider) createPremiumOrder(username string, months int) (string, error) {
	if months != 3 && months != 6 && months != 12 {
		return "", fmt.Errorf("длительность premium должна быть 3, 6 или 12 месяцев (получено: %d)", months)
	}

	client := &http.Client{Timeout: 10 * time.Second}

	searchURL := fmt.Sprintf("%s/api/v1/partner/premium/recipient/search?username=%s&months=%d",
		f.ApiURL, username, months)
	req, err := http.NewRequest(http.MethodGet, searchURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("API-Key", f.ApiKey)

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("fragment: ошибка поиска получателя premium: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("fragment: поиск получателя premium (%d): %s", resp.StatusCode, body)
	}

	var recipient fragmentRecipientResponse
	if err := json.NewDecoder(resp.Body).Decode(&recipient); err != nil {
		return "", err
	}
	if !recipient.Success || recipient.Recipient == "" {
		return "", fmt.Errorf("telegram пользователь '%s' не найден", username)
	}

	orderPayload := map[string]interface{}{
		"username":       username,
		"recipient_hash": recipient.Recipient,
		"months":         months,
		"wallet_type":    "TON",
	}
	jsonBody, err := json.Marshal(orderPayload)
	if err != nil {
		return "", err
	}

	req2, err := http.NewRequest(http.MethodPost, f.ApiURL+"/api/v1/partner/orders/premium", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	req2.Header.Set("API-Key", f.ApiKey)
	req2.Header.Set("Content-Type", "application/json")

	resp2, err := client.Do(req2)
	if err != nil {
		return "", err
	}
	defer resp2.Body.Close()

	if resp2.StatusCode >= 400 {
		body, _ := io.ReadAll(resp2.Body)
		return "", fmt.Errorf("fragment: создание premium заказа (%d): %s", resp2.StatusCode, body)
	}

	var orderResp fragmentOrderResponse
	if err := json.NewDecoder(resp2.Body).Decode(&orderResp); err != nil {
		return "", err
	}
	if orderResp.Error != "" {
		return "", fmt.Errorf("fragment premium order error: %s", orderResp.Error)
	}
	if orderResp.OrderId == "" {
		return "", fmt.Errorf("fragment: order_id не получен")
	}
	return orderResp.OrderId, nil
}

func (f *FragmentProvider) OrderStatus(order string) (*OrderStatusResponse, error) {
	return &OrderStatusResponse{Status: "Pending"}, nil
}

func (f *FragmentProvider) OrdersStatus(orders []string) (*BulkOrdersStatusResponse, error) {
	result := make(BulkOrdersStatusResponse)
	for _, o := range orders {
		result[o] = BulkOrderStatus{Status: "Pending"}
	}
	return &result, nil
}

func (handler *BuyHandler) fragmentWebhook() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		bodyBytes, err := io.ReadAll(r.Body)
		if err != nil {
			res.Json(w, "ошибка чтения запроса", 400)
			return
		}

		secret := os.Getenv("ISTAR_WEBHOOK_SECRET")
		if secret == "" {
			res.Json(w, "webhook not configured", 503)
			return
		}
		signature := r.Header.Get("X-iStar-Signature")
		if !verifyFragmentSignature(bodyBytes, secret, signature) {
			res.Json(w, "invalid signature", 401)
			return
		}

		var payload FragmentWebhookPayload
		if err := json.Unmarshal(bodyBytes, &payload); err != nil {
			res.Json(w, "bad request", 400)
			return
		}

		fmt.Println("[FRAGMENT WEBHOOK]", payload.EventType, "order:", payload.Order.Id)

		switch payload.EventType {
		case "order.completed":
			handler.BuyRepository.DataBase.
				Model(&Transaction{}).
				Where("\"order\" = ? AND price < 0", payload.Order.Id).
				Update("status", "completed")
		case "order.failed":
			go handler.processRefund(payload.Order.Id)
		}

		w.WriteHeader(http.StatusOK)
	}
}

func verifyFragmentSignature(body []byte, secret, signature string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

package buy

var GameProviders = map[string]string{
	"Mobile Legends Global":    "b2bulk",
	"Mobile Legends":           "b2bulk",
	"Mobile Legends Turkey":    "b2bulk",
	"Mobile Legends Russia":    "b2bulk",
	"Blood Strike":    "b2bulk",
	"PUBG Mobile":              "b2bulk",
	"Freefire Global":          "b2bulk",
	"Arena Breakout":           "b2bulk",
	"Delta Force":              "b2bulk",
	"Honor of Kings":           "b2bulk",
	"Honkai Star Rail":         "b2bulk",
	"Genshin Impact":           "b2bulk",
	"Mobile Legends Adventure": "b2bulk",
	"Magic Chess Gogo":         "b2bulk",
	"Watcher of Realms":        "b2bulk",
	"Whiteout Survival":        "b2bulk",
	"Punishing Gray Raven":     "b2bulk",
	"Telegram": "istar",
}
type Provider interface {
	CreateOrder(service int, link string) (order string, err error)
	OrderStatus(order string) (*OrderStatusResponse, error)
	OrdersStatus(orders []string) (*BulkOrdersStatusResponse, error)
	GetBalance() (string, string, error)
}
type ProviderRegistry struct {
	providers map[string]Provider
}

func NewProviderRegistry() *ProviderRegistry {
	return &ProviderRegistry{providers: make(map[string]Provider)}
}

func (r *ProviderRegistry) Register(name string, p Provider) {
	r.providers[name] = p
}

func (r *ProviderRegistry) Get(name string) (Provider, bool) {
	p, ok := r.providers[name]
	return p, ok
}

func (r *ProviderRegistry) All() map[string]Provider {
	return r.providers
}

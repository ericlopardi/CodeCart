package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"github.com/jshelley8117/CodeCart/internal/common"
	"github.com/jshelley8117/CodeCart/internal/model"
	"github.com/jshelley8117/CodeCart/internal/service"
	"github.com/jshelley8117/CodeCart/internal/utils"
	"go.uber.org/zap"
)

type OrderItemHandler struct {
	OrderItemService service.OrderItemService
}

func NewOrderItemHandler(orderItemService service.OrderItemService) OrderItemHandler {
	return OrderItemHandler{
		OrderItemService: orderItemService,
	}
}

func (oih OrderItemHandler) HandleCreateOrderItem(w http.ResponseWriter, r *http.Request) {
	zLog := utils.FromContext(r.Context(), zap.NewNop())
	zLog.Debug("entered HandleCreateOrderItem")

	orderIdPathVal := r.PathValue("orderId")
	if orderIdPathVal == "" {
		zLog.Error("orderId field in endpoint path parameter is missing")
		http.Error(w, "orderId is empty", http.StatusBadRequest)
		return
	}

	orderId, err := strconv.Atoi(orderIdPathVal)
	if err != nil {
		zLog.Error("failed to convert orderId value from string to integer")
		http.Error(w, "server failed to process orderId value", http.StatusInternalServerError)
		return
	}

	var request model.CreateOrderItemRequest

	body, err := io.ReadAll(r.Body)
	if err != nil {
		zLog.Warn(common.ERR_REQ_BODY_READ_FAIL, zap.Error(err))
		http.Error(w, common.ERR_CLIENT_REQUEST_FAIL, http.StatusBadRequest)
		return
	}

	if err := json.Unmarshal(body, &request); err != nil {
		zLog.Warn(common.ERR_REQ_UNMARSH_FAIL, zap.Error(err))
		http.Error(w, common.ERR_CLIENT_REQUEST_FAIL, http.StatusBadRequest)
		return
	}

	if err := validate.Struct(request); err != nil {
		zLog.Warn(common.ERR_VALIDATION_FAIL, zap.Error(err))
		http.Error(w, common.ERR_CLIENT_REQUEST_FAIL, http.StatusBadRequest)
		return
	}

	if err := oih.OrderItemService.CreateOrderItems(r.Context(), request, orderId); err != nil {
		zLog.Error("service invocation failed", zap.Error(err))
		http.Error(w, common.ERR_CLIENT_DB_PERSISTENCE_FAIL, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (oih OrderItemHandler) HandleGetAllOrderItems(w http.ResponseWriter, r *http.Request) {
	zLog := utils.FromContext(r.Context(), zap.NewNop())
	zLog.Debug("entered HandleGetAllOrderItems")

	orderIdPathVal := r.PathValue("orderId")
	if orderIdPathVal == "" {
		zLog.Error("orderId field in endpoint path parameter is missing")
		http.Error(w, "orderId is empty", http.StatusBadRequest)
		return
	}

	orderId, err := strconv.Atoi(orderIdPathVal)
	if err != nil {
		zLog.Error("failed to convert orderId value from string to integer")
		http.Error(w, "server failed to process orderId value", http.StatusInternalServerError)
		return
	}

	page, pageSize, err := utils.ParsePaginationInput(r.Context(), r)
	if err != nil {
		zLog.Error("failed to parse pagination input", zap.Error(err))
		http.Error(w, common.ERR_CLIENT_REQUEST_FAIL, http.StatusBadRequest)
		return
	}

	items, total, err := oih.OrderItemService.GetAllOrderItems(r.Context(), orderId, page, pageSize)
	if err != nil {
		zLog.Error("service invocation failed", zap.Error(err))
		http.Error(w, common.ERR_CLIENT_DB_RETRIEVAL_FAIL, http.StatusInternalServerError)
		return
	}

	totalPages := utils.CalculateTotalPages(int(total), pageSize)

	response := common.PaginatedResponse{
		Data:       items,
		Page:       page,
		PageSize:   pageSize,
		TotalItems: total,
		TotalPages: totalPages,
	}

	apiResponse, err := json.Marshal(response)
	if err != nil {
		zLog.Error(common.ERR_REQ_MARSH_FAIL, zap.Error(err))
		http.Error(w, common.ERR_CLIENT_REQUEST_FAIL, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(apiResponse)
}

func (oih OrderItemHandler) HandleFetchOrderItemById(w http.ResponseWriter, r *http.Request) {
	zLog := utils.FromContext(r.Context(), zap.NewNop())
	zLog.Debug("entered HandleFetchOrderItemById")

	orderIdPathVal := r.PathValue("orderId")
	if orderIdPathVal == "" {
		zLog.Error("orderId field in endpoint path parameter is missing")
		http.Error(w, "orderId is empty", http.StatusBadRequest)
		return
	}

	orderId, err := strconv.Atoi(orderIdPathVal)
	if err != nil {
		zLog.Error("failed to convert orderId value from string to integer")
		http.Error(w, "server failed to process orderId value", http.StatusInternalServerError)
		return
	}

	idPathVal := r.PathValue("id")
	if idPathVal == "" {
		zLog.Error("ID field in endpoint path parameter is missing")
		http.Error(w, "ID is empty", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idPathVal)
	if err != nil {
		zLog.Error("failed to convert id value from string to integer")
		http.Error(w, "server failed to process ID value", http.StatusInternalServerError)
		return
	}

	item, err := oih.OrderItemService.FetchOrderItemsById(r.Context(), orderId, id)
	if err != nil {
		zLog.Error("service invocation failed", zap.Int("order_id", orderId), zap.Int("id", id), zap.Error(err))
		http.Error(w, common.ERR_CLIENT_DB_RETRIEVAL_FAIL, http.StatusInternalServerError)
		return
	}

	apiResponse, err := json.Marshal(item)
	if err != nil {
		zLog.Error(common.ERR_REQ_MARSH_FAIL, zap.Error(err))
		http.Error(w, common.ERR_CLIENT_REQUEST_FAIL, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(apiResponse)
}

func (oih OrderItemHandler) HandleUpdateOrderItemById(w http.ResponseWriter, r *http.Request) {
	zLog := utils.FromContext(r.Context(), zap.NewNop())
	zLog.Debug("entered HandleUpdateOrderItemById")

	orderIdPathVal := r.PathValue("orderId")
	if orderIdPathVal == "" {
		zLog.Error("orderId field in endpoint path parameter is missing")
		http.Error(w, "orderId is empty", http.StatusBadRequest)
		return
	}

	orderId, err := strconv.Atoi(orderIdPathVal)
	if err != nil {
		zLog.Error("failed to convert orderId value from string to integer")
		http.Error(w, "server failed to process orderId value", http.StatusInternalServerError)
		return
	}

	idPathVal := r.PathValue("id")
	if idPathVal == "" {
		zLog.Error("ID field in endpoint path parameter is missing")
		http.Error(w, "ID is empty", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idPathVal)
	if err != nil {
		zLog.Error("failed to convert id value from string to integer")
		http.Error(w, "server failed to process ID value", http.StatusInternalServerError)
		return
	}

	var request model.UpdateOrderItemRequest

	body, err := io.ReadAll(r.Body)
	if err != nil {
		zLog.Error(common.ERR_REQ_BODY_READ_FAIL, zap.Int("id", id), zap.Error(err))
		http.Error(w, common.ERR_CLIENT_REQUEST_FAIL, http.StatusBadRequest)
		return
	}

	if err := json.Unmarshal(body, &request); err != nil {
		zLog.Error(common.ERR_REQ_UNMARSH_FAIL, zap.Error(err))
		http.Error(w, common.ERR_CLIENT_REQUEST_FAIL, http.StatusBadRequest)
		return
	}

	if err := validate.Struct(request); err != nil {
		zLog.Error(common.ERR_VALIDATION_FAIL, zap.Error(err))
		http.Error(w, common.ERR_CLIENT_REQUEST_FAIL, http.StatusBadRequest)
		return
	}

	if err := oih.OrderItemService.UpdateOrderItemsById(r.Context(), request, orderId, id); err != nil {
		zLog.Error("service invocation failed", zap.Int("order_id", orderId), zap.Int("id", id), zap.Error(err))
		http.Error(w, common.ERR_CLIENT_DB_PERSISTENCE_FAIL, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (oih OrderItemHandler) HandleDeleteOrderItemById(w http.ResponseWriter, r *http.Request) {
	zLog := utils.FromContext(r.Context(), zap.NewNop())
	zLog.Debug("entered HandleDeleteOrderItemById")

	orderIdPathVal := r.PathValue("orderId")
	if orderIdPathVal == "" {
		zLog.Error("orderId field in endpoint path parameter is missing")
		http.Error(w, "orderId is empty", http.StatusBadRequest)
		return
	}

	orderId, err := strconv.Atoi(orderIdPathVal)
	if err != nil {
		zLog.Error("failed to convert orderId value from string to integer")
		http.Error(w, "server failed to process orderId value", http.StatusInternalServerError)
		return
	}

	idPathVal := r.PathValue("id")
	if idPathVal == "" {
		zLog.Error("ID field in endpoint path parameter is missing")
		http.Error(w, "ID is empty", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idPathVal)
	if err != nil {
		zLog.Error("failed to convert id value from string to integer")
		http.Error(w, "server failed to process ID value", http.StatusInternalServerError)
		return
	}

	if err := oih.OrderItemService.DeleteOrderItemsById(r.Context(), orderId, id); err != nil {
		zLog.Error("service invocation failed", zap.Int("order_id", orderId), zap.Int("id", id), zap.Error(err))
		http.Error(w, common.ERR_CLIENT_DB_DELETE_FAIL, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

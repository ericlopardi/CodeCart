package service

import (
	"context"
	"fmt"

	"github.com/jshelley8117/CodeCart/internal/model"
	"github.com/jshelley8117/CodeCart/internal/persistence"
	"github.com/jshelley8117/CodeCart/internal/utils"
	"go.uber.org/zap"
)

type OrderItemService struct {
	OrderItemPersistence persistence.OrderItemPersistence
}

func NewOrderItemService(orderItemPersistence persistence.OrderItemPersistence) OrderItemService {
	return OrderItemService{
		OrderItemPersistence: orderItemPersistence,
	}
}

func (ois OrderItemService) CreateOrderItems(ctx context.Context, request model.CreateOrderItemRequest, orderId int) error {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("entered CreateOrderItems")

	orderItemDomainModel := model.OrderItem{
		OrderId:          orderId,
		ProductVariantId: request.ProductVariantId,
		Quantity:         request.Quantity,
		UnitPrice:        request.UnitPrice,
		Discount:         request.Discount,
	}

	if err := ois.OrderItemPersistence.PersistCreateItemOrder(ctx, orderItemDomainModel); err != nil {
		zLog.Error("persistence invocation failed", zap.Error(err))
		return err
	}

	return nil
}

func (ois OrderItemService) GetAllOrderItems(ctx context.Context, orderId, page, pageSize int) ([]model.OrderItem, int64, error) {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("entered GetAllOrderItems")

	rows, total, err := ois.OrderItemPersistence.FetchAllOrderItemsByOrderId(ctx, orderId, page, pageSize)
	if err != nil {
		zLog.Error("persistence invocation failed", zap.Error(err))
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]model.OrderItem, 0)

	for rows.Next() {
		var item model.OrderItem
		if err := rows.Scan(
			&item.Id,
			&item.OrderId,
			&item.ProductVariantId,
			&item.Quantity,
			&item.UnitPrice,
			&item.Discount,
		); err != nil {
			zLog.Error("scan operation failed", zap.Error(err))
			return nil, 0, err
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		zLog.Error("error occurred while iterating through sql rows", zap.Error(err))
		return nil, 0, err
	}

	return items, total, nil
}

func (ois OrderItemService) FetchOrderItemsById(ctx context.Context, orderId int, id int) (model.OrderItem, error) {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("entered FetchOrderItemsById")

	row := ois.OrderItemPersistence.PersistFetchOrderItemsByID(ctx, orderId, id)

	var item model.OrderItem
	if err := row.Scan(
		&item.Id,
		&item.OrderId,
		&item.ProductVariantId,
		&item.Quantity,
		&item.UnitPrice,
		&item.Discount,
	); err != nil {
		zLog.Error("scan operation failed", zap.Error(err))
		return model.OrderItem{}, err
	}

	return item, nil
}

func (ois OrderItemService) UpdateOrderItemsById(ctx context.Context, request model.UpdateOrderItemRequest, orderId int, id int) error {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("entered UpdateOrderItemsById")

	updates := make(map[string]any)

	if request.ProductVariantId != nil {
		updates["product_variant_id"] = *request.ProductVariantId
	}
	if request.Quantity != nil {
		updates["quantity"] = *request.Quantity
	}
	if request.UnitPrice != nil {
		updates["unit_price"] = *request.UnitPrice
	}
	if request.Discount != nil {
		updates["discount"] = *request.Discount
	}

	if len(updates) == 0 {
		zLog.Error("no updates found", zap.Int("order_item_id", id))
		return fmt.Errorf("no updates found")
	}

	if err := ois.OrderItemPersistence.PersistUpdateOrderItemsById(ctx, orderId, id, updates); err != nil {
		zLog.Error("persistence invocation failed", zap.Error(err))
		return err
	}

	return nil
}

func (ois OrderItemService) DeleteOrderItemsById(ctx context.Context, orderId int, id int) error {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("entered DeleteOrderItemsById")

	if err := ois.OrderItemPersistence.PersistDeleteOrderItemsById(ctx, orderId, id); err != nil {
		zLog.Error("persistence invocation failed", zap.Error(err))
		return err
	}

	return nil
}

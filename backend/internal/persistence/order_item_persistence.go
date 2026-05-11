package persistence

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/jshelley8117/CodeCart/internal/model"
	"github.com/jshelley8117/CodeCart/internal/utils"
	"go.uber.org/zap"
)

type OrderItemPersistence struct {
	DbHandle *sql.DB
}

func NewOrderItemPersistance(dbHandle *sql.DB) OrderItemPersistence {
	return OrderItemPersistence{
		DbHandle: dbHandle,
	}
}

func (oip OrderItemPersistence) PersistCreateItemOrder(ctx context.Context, orderItemDomain model.OrderItem) error {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("Entered PersistCreateItemOrder")

	query := `
		INSERT INTO order_items (order_id, product_variant_id, quantity, unit_price, discount)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := oip.DbHandle.ExecContext(
		ctx,
		query,
		orderItemDomain.OrderId,
		orderItemDomain.ProductVariantId,
		orderItemDomain.Quantity,
		orderItemDomain.UnitPrice,
		orderItemDomain.Discount,
	)
	if err != nil {
		zLog.Error("ExecContext failed", zap.Error(err))
		return err
	}
	return nil
}

func (oip OrderItemPersistence) FetchAllOrderItemsByOrderId(ctx context.Context, orderId, page, pageSize int) (*sql.Rows, int64, error) {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("Entered FetchAllOrderItemsByOrderId")

	var total int64
	countQuery := "SELECT COUNT(*) FROM order_items WHERE order_id = $1"
	if err := oip.DbHandle.QueryRowContext(ctx, countQuery, orderId).Scan(&total); err != nil {
		zLog.Error("QueryRowContext failed on the pagination count query", zap.Error(err))
		return nil, 0, err
	}

	offset := (page - 1) * pageSize

	query := `
		SELECT id, order_id, product_variant_id, quantity, unit_price, discount
		FROM order_items
		WHERE order_id = $1
		ORDER BY id ASC
		LIMIT $2 OFFSET $3
	`

	rows, err := oip.DbHandle.QueryContext(ctx, query, orderId, pageSize, offset)
	if err != nil {
		zLog.Error("QueryContext failed", zap.Error(err))
		return nil, 0, err
	}
	return rows, total, nil
}

func (oip OrderItemPersistence) PersistFetchOrderItemsByID(ctx context.Context, orderId int, id int) *sql.Row {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("Entered PersistFetchOrderItemsByID")

	query := `
		SELECT id, order_id, product_variant_id, quantity, unit_price, discount
		FROM order_items
		WHERE order_id = $1 AND id = $2
	`

	return oip.DbHandle.QueryRowContext(ctx, query, orderId, id)
}

func (oip OrderItemPersistence) PersistUpdateOrderItemsById(ctx context.Context, orderId int, id int, updates map[string]any) error {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("Entered PersistUpdateOrderItemsById")

	allowedFields := map[string]bool{
		"product_variant_id": true,
		"quantity":           true,
		"unit_price":         true,
		"discount":           true,
	}

	query := "UPDATE order_items SET "
	args := []any{}
	argPosition := 1

	for field, value := range updates {
		if !allowedFields[field] {
			zLog.Error("Attempted to update invalid field", zap.String("invalid_field", field))
			return fmt.Errorf("invalid field: %s", field)
		}

		if argPosition > 1 {
			query += ", "
		}
		query += field + " = $" + fmt.Sprintf("%d", argPosition)
		args = append(args, value)
		argPosition++
	}

	query += " WHERE order_id = $" + fmt.Sprintf("%d", argPosition)
	args = append(args, orderId)
	argPosition++

	query += " AND id = $" + fmt.Sprintf("%d", argPosition)
	args = append(args, id)

	_, err := oip.DbHandle.ExecContext(ctx, query, args...)
	if err != nil {
		zLog.Error("ExecContext failed for PersistUpdateOrderItemsById", zap.Error(err))
		return err
	}
	return nil
}

func (oip OrderItemPersistence) PersistDeleteOrderItemsById(ctx context.Context, orderId int, id int) error {
	zLog := utils.FromContext(ctx, zap.NewNop())
	zLog.Debug("Entered PersistDeleteOrderItemsById")

	query := `
		DELETE FROM order_items
		WHERE order_id = $1 AND id = $2
	`

	if _, err := oip.DbHandle.ExecContext(ctx, query, orderId, id); err != nil {
		zLog.Error("ExecContext failed for PersistDeleteOrderItemsById", zap.Error(err))
		return err
	}
	return nil
}

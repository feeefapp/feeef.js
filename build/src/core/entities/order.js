export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["draft"] = "draft";
    OrderStatus["pending"] = "pending";
    OrderStatus["processing"] = "processing";
    OrderStatus["completed"] = "completed";
    OrderStatus["cancelled"] = "cancelled";
})(OrderStatus || (OrderStatus = {}));
// PaymentStatus
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["unpaid"] = "unpaid";
    PaymentStatus["paid"] = "paid";
    PaymentStatus["received"] = "received";
})(PaymentStatus || (PaymentStatus = {}));
export var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["pending"] = "pending";
    DeliveryStatus["delivering"] = "delivering";
    DeliveryStatus["delivered"] = "delivered";
    DeliveryStatus["returned"] = "returned";
})(DeliveryStatus || (DeliveryStatus = {}));

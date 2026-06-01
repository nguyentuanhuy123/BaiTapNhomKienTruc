import random
from locust import HttpUser, task, between

class FlashSaleBuyer(HttpUser):
    # Mỗi người dùng ảo sẽ nghỉ ngẫu nhiên từ 100ms đến 300ms giữa các lần nhấn mua
    wait_time = between(0.1, 0.3)

    @task
    def purchase_deal(self):
        # 1. Định nghĩa dữ liệu checkout giật deal
        payload = {
            "productId": "SL-X",  # Mã SKU sản phẩm đang chạy Flash Sale của bạn
            "userId": str(random.randint(1, 10000)),  # Giả lập ngẫu nhiên hàng chục nghìn User ID khác nhau
            "quantity": 1
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # 2. Gửi request POST trực tiếp vào API Gateway cổng 9000
        # self.client kế thừa từ requests session, sẽ tự động ghi nhận lượng RPS và Latency
        self.client.post(
            "/api/v1/flashsale/command/checkout", 
            json=payload, 
            headers=headers
        )

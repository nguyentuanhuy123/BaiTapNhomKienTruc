# 🎙️ Kịch Bản Thuyết Trình Bảo Vệ Đồ Án Kiến Trúc Hệ Thống

Tài liệu này cung cấp **Cấu trúc Slide** và **Lời thoại thuyết trình chi tiết từng trang (Speaker Notes)** được thiết kế riêng cho buổi bảo vệ đồ án của bạn. Kịch bản được viết theo văn phong trang trọng, tự tin, làm nổi bật tư duy thiết kế hệ thống phân tán chịu tải cao.

---

## 🗂️ CẤU TRÚC 8 TRANG SLIDE THUYẾT TRÌNH

```
Slide 1: Giới thiệu chung & Đặt vấn đề
  │
  ├─► Slide 2: Kiến trúc tổng thể hệ thống (Đọc sơ đồ khối vật lý)
  │
  ├─► Slide 3: Tại sao phân rã thành Microservices?
  │
  ├─► Slide 4: Thiết kế giải pháp Flash Sale chịu tải cao (Hazelcast RAM)
  │
  ├─► Slide 5: Quy trình đặt hàng siêu tốc & Giảm tải DB (Kafka & Saga)
  │
  ├─► Slide 6: Giải pháp đồng bộ kho & Bảo vệ dữ liệu (Pub/Sub mới vá)
  │
  ├─► Slide 7: Chiến lược Scale hệ thống lên hàng triệu request
  │
  └─► Slide 8: Kết luận & Điểm cộng công nghệ AI (MCP Server)
```

---

## 🗣️ KỊCH BẢN CHI TIẾT TỪNG SLIDE (SPEAKER NOTES)

---

### 🖼️ SLIDE 1: GIỚI THIỆU CHUNG & ĐẶT VẤN ĐỀ
*   **Tiêu đề slide:** Xây Dựng Hệ Thống Thương Mại Điện Tử Microservices Chịu Tải Cao (Flash Sale)
*   **Hình ảnh minh họa gợi ý:** Logo các công nghệ sử dụng (Spring Boot, Kafka, Redis, Hazelcast, Docker).
*   **Lời thoại thuyết trình:**
    > *"Kính thưa thầy cô và các bạn, hôm nay nhóm chúng em xin phép được bảo vệ đồ án môn học với đề tài: **'Xây dựng hệ thống thương mại điện tử dựa trên kiến trúc Microservices chịu tải cao'**. 
    >
    > Trong kỷ nguyên số, các sự kiện mở bán Flash Sale quy mô lớn luôn là bài toán thách thức nhất đối với mọi kỹ sư công nghệ. Khi hàng trăm ngàn người cùng click mua một sản phẩm tại một thời điểm, các hệ thống Monolith hoặc Database truyền thống sẽ gặp ngay hiện tượng **Nghẽn cổ chai (Connection Bottleneck)** và **Âm kho (Overselling)**, dẫn đến sập toàn bộ hệ thống. 
    > 
    > Nhận thấy tầm quan trọng của vấn đề, nhóm chúng em đã nghiên cứu và triển khai một giải pháp kiến trúc phân tán hiện đại, kết hợp sức mạnh của **Space-Based Architecture (Hazelcast RAM)** và **Event-Driven Architecture (Apache Kafka)** để giải quyết triệt để thách thức chịu tải này."*

---

### 🖼️ SLIDE 2: SƠ ĐỒ KIẾN TRÚC VẬT LÝ HỆ THỐNG
*   **Tiêu đề slide:** Sơ Đồ Kiến Trúc Container (C4 Model)
*   **Hình ảnh minh họa gợi ý:** Đưa ảnh sơ đồ kiến trúc vật lý chi tiết 11 dịch vụ mà bạn đã vẽ.
*   **Lời thoại thuyết trình:**
    > *"Thưa thầy cô, trên màn hình là sơ đồ kiến trúc vật lý toàn cục của hệ thống được vẽ theo mô hình **C4 Container**. 
    >
    > Request từ Quản trị viên và Khách hàng sẽ đi qua cửa ngõ **API Gateway** duy nhất đóng vai trò định tuyến và lọc bảo mật chống DDoS bằng **Rate Limiter**.
    >
    > Phía sau Gateway là **11 Microservices chuyên biệt** chạy độc lập, áp dụng mô hình **Database-per-service** để đảm bảo tính cô lập dữ liệu. Tất cả các dịch vụ này tự động đăng ký và phát hiện lẫn nhau thông qua **Discovery Server (Netflix Eureka)**. 
    >
    > Trung tâm của hệ thống là **Apache Kafka** đóng vai trò xương sống truyền thông tin bất đồng bộ, kết hợp cùng **Hazelcast RAM cluster** xử lý kho ảo và **Redis** làm bộ đệm cache nhanh."*

---

### 🖼️ SLIDE 3: TẠI SAO LẠI PHÂN RÃ THÀNH MICROSERVICES?
*   **Tiêu đề slide:** Lý Do Phân Rã Dịch Vụ & Lợi Ích Mang Lại
*   **Hình ảnh minh họa gợi ý:** Hình vẽ mô tả so sánh cấu trúc Monolith vs Microservices.
*   **Lời thoại thuyết trình:**
    > *"Một câu hỏi đặt ra là tại sao chúng em lại phân rã hệ thống thành các service nhỏ? Câu trả lời nằm ở **3 giá trị kỹ nghệ phần mềm** sau:
    >
    > 1.  **Scale độc lập:** Khi Flash Sale diễn ra, lượng truy cập vào `flashsale-service` và `product-service` tăng vọt gấp 100 lần. Chúng em chỉ cần nhân bản (Autoscale) các Pods chứa 2 service này trên cụm Kubernetes mà không cần tốn tài nguyên scale các service chạy nhẹ như `user-service` hay `auth-service`.
    > 2.  **Cô lập lỗi hoàn hảo:** Nếu service gửi mail `notification-service` bị sập, nó không hề ảnh hưởng đến luồng mua hàng và thanh toán chính. Đơn hàng vẫn được tạo và xử lý thành công, email thông báo sẽ được xếp hàng trong Kafka để gửi sau.
    > 3.  **Đa dạng hóa công nghệ:** Nhóm có thể chọn **PostgreSQL** cho quản lý thông tin người dùng, **MySQL** cho đơn hàng cần tính giao dịch ACID cao, và **Hazelcast RAM Grid** cho xử lý giật deal siêu tốc."*

---

### 🖼️ SLIDE 4: THIẾT KẾ GIẢI PHÁP FLASH SALE TRÊN RAM
*   **Tiêu đề slide:** Thiết Kế Xử Lý Giật Deal Siêu Tốc (Space-Based Architecture)
*   **Hình ảnh minh họa gợi ý:** Biểu đồ mô tả việc nạp kho ảo lên RAM Hazelcast.
*   **Lời thoại thuyết trình:**
    > *"Để giải quyết bài toán tranh mua hàng nghìn request/giây mà không làm nghẽn Database dưới đĩa cứng, chúng em áp dụng kiến trúc **Space-Based**.
    >
    > Trước giờ Flash Sale, toàn bộ tồn kho ảo của sản phẩm được **Pre-warm (Nạp nóng)** lên phân vùng nhớ RAM phân tán của cụm **Hazelcast Grid**. 
    >
    > Khi khách hàng bấm đặt mua, hệ thống áp dụng cơ chế **Distributed Lock (Khóa phân tán)** của Hazelcast trực tiếp trên RAM để đảm bảo tính nguyên tử (atomic). Việc kiểm tra số lượng và trừ kho diễn ra hoàn toàn trên RAM vật lý với tốc độ xử lý **dưới 1 mili-giây**, loại bỏ hoàn toàn chi phí I/O ổ đĩa cứng của database."*

---

### 🖼️ SLIDE 5: QUY TRÌNH ĐẶT HÀNG BẤT ĐỒNG BỘ qua KAFKA
*   **Tiêu đề slide:** Xử Lý Đơn Hàng Bất Đồng Bộ & San Phẳng Đỉnh Tải (Traffic Shaving)
*   **Hình ảnh minh họa gợi ý:** Sơ đồ luồng đi của Kafka đến Order Service và DB.
*   **Lời thoại thuyết trình:**
    > *"Sau khi trừ kho ảo trên RAM thành công, làm thế nào để lưu hóa đơn vào Database một cách an toàn mà không làm sập DB?
    >
    > Giải pháp của chúng em là áp dụng mẫu thiết kế **Traffic Shaving (Cắt ngọn băng thông)** thông qua **Apache Kafka**. `flashsale-service` chỉ cần bắn sự kiện đặt hàng thành công vào Kafka rồi lập tức trả về phản hồi **HTTP 202 Accepted (Đang xử lý)** cho người dùng. 
    >
    > Phía sau, `order-service` sẽ bình tĩnh tiêu thụ hàng đợi Kafka bất đồng bộ để chốt hóa đơn xuống MySQL DB với tốc độ ghi ổn định của database. Sự kết hợp này giúp hệ thống chịu được xung lực tải cực lớn ở mặt trước mà cơ sở dữ liệu ở mặt sau vẫn cực kỳ an toàn."*

---

### 🖼️ SLIDE 6: GIẢI PHÁP ĐỒNG BỘ KHO TOÀN VẸN (REDIS PUB/SUB)
*   **Tiêu đề slide:** Cơ Chế Khấu Trừ & Hoàn Kho Database Tự Động
*   **Hình ảnh minh họa gợi ý:** Sơ đồ luồng đồng bộ kho (bước nạp trừ kho DB và bước hoàn kho thừa bằng Redis Pub/Sub).
*   **Lời thoại thuyết trình:**
    > *"Một bài toán quan trọng là làm sao đồng bộ lượng hàng ảo trên RAM và lượng hàng vật lý dưới Database chính để tránh âm kho hay thất thoát hàng hóa? Nhóm đã triển khai giải pháp đồng bộ qua **Redis Pub/Sub**:
    >
    > *   **Khi bắt đầu chiến dịch:** `flashsale-service` nạp kho ảo lên RAM, đồng thời phát sự kiện **`inventory-deduct-channel`**. `inventory-service` nhận được tín hiệu và **tự động trừ bớt tồn kho dưới DB gốc** để tránh việc người dùng luồng thường mua đè lên hàng Flash Sale.
    > *   **Khi kết thúc chiến dịch:** `flashsale-service` tính toán lượng hàng thừa còn lại trên RAM và phát sự kiện **`inventory-reclaim-channel`**. Dịch vụ kho nhận tín hiệu sẽ **tự động cộng hoàn lại hàng thừa vào DB chính**, đồng thời dọn dẹp RAM vật lý $\rightarrow$ Đảm bảo tính toàn vẹn dữ liệu tuyệt đối."*

---

### 🖼️ SLIDE 7: CHIẾN LƯỢC SCALE HỆ THỐNG LÊN HÀNG TRIỆU REQUEST
*   **Tiêu đề slide:** Kiến Trúc Scale Ngang Toàn Diện (Horizontal Scaling)
*   **Hình ảnh minh họa gợi ý:** Bảng so sánh hoặc công thức toán học tính tải từ tài liệu `HIGH_PERFORMANCE_SCALING.md`.
*   **Lời thoại thuyết trình:**
    > *"Để nâng cấp hệ thống phục vụ hàng triệu người dùng đồng thời, chúng em thiết kế chiến lược Scale 4 lớp:
    >
    > 1.  **Lớp Biên:** Sử dụng **CDN** để cache 95% tài nguyên tĩnh (giao diện, ảnh giày), giảm tải tối đa cho cụm Backend.
    > 2.  **Lớp Tính Toán:** Scale ngang tự động **Stateless Pods** thông qua Kubernetes dựa trên mức tiêu thụ CPU/RAM.
    > 3.  **Lớp Bộ Nhớ RAM:** Tách phân mảnh dữ liệu trên nhiều Node **Hazelcast RAM Grid** và sử dụng **Entry Processor** để xử lý không cần khóa (lock-free), giảm độ trễ mạng.
    > 4.  **Lớp Database:** Áp dụng ghi DB theo lô (**Batch Writes**) từ Kafka Consumer và chạy mô hình **Master-Slave Database (Đọc Ghi tách biệt)** để tối ưu hóa truy vấn dữ liệu."*

---

### 🖼️ SLIDE 8: KẾT LUẬN & ĐIỂM SÁNG CÔNG NGHỆ AI
*   **Tiêu đề slide:** Kết Luận & Tích Hợp Trí Tuệ Nhân Tạo (Spring AI MCP Server)
*   **Hình ảnh minh họa gợi ý:** Biểu tượng robot AI tích hợp vào hệ thống.
*   **Lời thoại thuyết trình:**
    > *"Tổng kết lại, đồ án của chúng em đã xây dựng thành công một hệ thống thương mại điện tử Microservices chuẩn chỉnh, giải quyết trọn vẹn bài toán chịu tải cao của các chiến dịch Flash Sale bằng các giải pháp phân tán tiên tiến nhất.
    >
    > **Đặc biệt, một điểm sáng công nghệ đột phá của dự án** là chúng em đã tích hợp thành công dịch vụ **MCP Server sử dụng Spring AI**. Dịch vụ này cho phép đóng gói toàn bộ nghiệp vụ hệ thống thành các Tool thông minh để cung cấp trực tiếp cho các mô hình AI Agent (như Gemini, Claude) có thể tự động trò chuyện, truy vấn thông tin sản phẩm và hỗ trợ mua sắm tự động cho khách hàng.
    >
    > Nhóm chúng em xin chân thành cảm ơn sự lắng nghe của quý thầy cô trong hội đồng và rất mong nhận được những câu hỏi đóng góp ý kiến để đồ án được hoàn thiện hơn nữa. Nhóm chúng em xin cảm ơn!"*

---

## ❓ 3 BỘ CÂU HỎI PHẢN BIỆN TIỀN NĂNG & CÁCH TRẢ LỜI ĐIỂM 10

#### 💬 Câu hỏi 1: Tại sao lại dùng cả Hazelcast và Redis? Sao không dùng 1 loại cho đỡ phức tạp?
*   **Cách trả lời chuẩn:** 
    > *"Dạ thưa thầy cô, hai công nghệ này được chúng em sử dụng cho hai mục đích chuyên biệt hoàn toàn khác nhau để tối ưu hóa hiệu năng:
    > *   **Redis** được dùng làm **Cache phân phối** cho các dữ liệu ít thay đổi nhưng tần suất đọc rất cao (như danh sách sản phẩm, danh mục sản phẩm) và dùng làm kênh **Pub/Sub** gọn nhẹ để đồng bộ sự kiện giữa các service.
    > *   Trong khi đó, **Hazelcast** đóng vai trò là một **In-Memory Data Grid (IMDG)** mạnh mẽ. Chúng em cần tận dụng tính năng **Distributed Lock (Khóa phân tán)** có độ trễ cực thấp và cơ chế **Entry Processor** chạy tính toán trực tiếp trên RAM của Hazelcast để xử lý tranh mua lượng lớn trong Flash Sale mà Redis thông thường khó đáp ứng an toàn bằng luồng đơn."*

#### 💬 Câu hỏi 2: Mô hình Saga trong Order Service giải quyết bài toán giao dịch phân tán thế nào? Nếu thanh toán lỗi thì sao?
*   **Cách trả lời chuẩn:**
    > *"Dạ thưa thầy cô, vì mỗi microservice quản lý một database riêng, chúng em không thể dùng giao dịch ACID thông thường. Nhóm đã áp dụng **Choreography-based Saga Pattern** (Saga dựa trên sự kiện tự phát):
    > *   Khi đơn hàng được tạo với trạng thái `PENDING` $\rightarrow$ bắn sự kiện qua Kafka $\rightarrow$ `Payment Service` nhận sự kiện để thực hiện thanh toán.
    > *   Nếu thanh toán lỗi (ví dụ: tài khoản không đủ tiền), `Payment Service` sẽ bắn sự kiện `PaymentFailedEvent` qua Kafka $\rightarrow$ `Order Service` lắng nghe và thực hiện **giao dịch bù (Compensating Transaction)** bằng cách cập nhật trạng thái đơn hàng thành `CANCELLED` và bắn sự kiện để trả lại hàng vào kho DB gốc thông qua `Inventory Service`. Luồng này đảm bảo tính nhất quán cuối cùng (**Eventual Consistency**) của hệ thống."*

#### 💬 Câu hỏi 3: Nếu Apache Kafka bị nghẽn hoặc sập giữa chừng thì sao?
*   **Cách trả lời chuẩn:**
    > *"Dạ thưa thầy cô, trong thiết kế thực tế:
    > *   Chúng em chạy cụm **Kafka Cluster có từ 3 Brokers trở lên** kèm cấu hình nhân bản phân mảnh (**Replication Factor = 2 hoặc 3**). Nếu một broker bị sập, các broker khác lập tức lên thay thế mà không gây mất dữ liệu.
    > *   Trong trường hợp hiếm hoi cả cụm Kafka bị sập, các service gửi tin nhắn sẽ lưu tạm sự kiện vào bảng **Outbox Pattern** ở Database của chính nó. Khi Kafka online trở lại, một tiến trình chạy ngầm (CDC hoặc Scheduler) sẽ quét bảng này và gửi bù tin nhắn $\rightarrow$ Đảm bảo không bao giờ bị mất đơn hàng."*

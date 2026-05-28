package com.fit.microservices.user.service.Impl;

import com.fit.microservices.user.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    /**
     * Upload avatar lên S3 vào folder "avatars/".
     * Trả về public URL của file sau khi upload.
     */
    @Override
    public String uploadAvatar(MultipartFile file, Long userId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";

        // Key: avatars/{userId}/{uuid}{ext}  → mỗi user có folder riêng
        String key = "avatars/" + userId + "/" + UUID.randomUUID() + extension;

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                // Không set ACL — bucket dùng "Bucket owner enforced" (ACL bị tắt)
                // Public access được cấp qua Bucket Policy thay thế
                .build();

        s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        String url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;
        log.info("Uploaded avatar for user {} → {}", userId, url);
        return url;
    }

    /**
     * Xoá object cũ khỏi S3 (khi user đổi avatar).
     * Chỉ xoá nếu URL thuộc bucket này (tránh xoá ảnh mặc định bên ngoài).
     */
    @Override
    public void deleteIfBucketUrl(String avatarUrl) {
        if (avatarUrl == null || !avatarUrl.contains(bucketName)) {
            return;
        }
        try {
            // Tách key từ URL: https://bucket.s3.region.amazonaws.com/{key}
            String prefix = "amazonaws.com/";
            int idx = avatarUrl.indexOf(prefix);
            if (idx == -1) return;
            String key = avatarUrl.substring(idx + prefix.length());

            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
            log.info("Deleted old avatar from S3: {}", key);
        } catch (Exception e) {
            log.warn("Could not delete old avatar from S3: {}", avatarUrl, e);
        }
    }
}

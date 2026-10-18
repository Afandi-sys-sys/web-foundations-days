# SnapShare Scaling Plan

## 1. Assumptions and Daily Active Users

SnapShare is a photo-sharing application where users upload photos and scroll through feeds containing photos from people they follow.

The following assumptions are used:

- Registered users: 10,000,000.
- Daily active users: 10% of registered users.
- Photos uploaded per active user per day: 1.
- Feed pages viewed per active user per day: 50.
- Average original photo size: 2 MB.
- Average thumbnail size: 50 KB.
- One day is approximately 100,000 seconds for easy calculations.
- Peak traffic is estimated to be 5 times the average traffic.
- Storage estimates use decimal units, where 1 GB = 1,000 MB and 1 TB = 1,000 GB.
- All uploaded photos and thumbnails are retained for one year, with no deletions or additional compression.

### Daily active users

Daily active users = Registered users × Daily activity percentage

= 10,000,000 × 10%

= **1,000,000 daily active users.**

## 2. Traffic and Storage Estimates

### Uploads per second

Each active user uploads one photo per day.

Daily uploads = 1,000,000 × 1

= 1,000,000 uploads per day.

Average uploads per second = 1,000,000 ÷ 100,000

= **10 uploads per second.**

Peak uploads per second = 10 × 5

= **50 uploads per second.**

### Feed views per second

Each active user views 50 feed pages per day.

Daily feed views = 1,000,000 × 50

= 50,000,000 feed views per day.

Average feed views per second = 50,000,000 ÷ 100,000

= **500 feed views per second.**

Peak feed views per second = 500 × 5

= **2,500 feed views per second.**

### Photo storage per year

Each day, SnapShare receives 1,000,000 original photos.

Daily original photo storage:

1,000,000 × 2 MB = 2,000,000 MB

= 2,000 GB = 2 TB per day.

Annual original photo storage:

2 TB × 365 = **730 TB per year.**

Each original photo also receives a 50 KB thumbnail.

Daily thumbnail storage:

1,000,000 × 50 KB = 50,000,000 KB

= 50 GB per day.

Annual thumbnail storage:

50 GB × 365 = **18.25 TB per year.**

Total annual storage:

730 TB + 18.25 TB = **748.25 TB per year.**

These estimates exclude database records, backups, replicas, and additional storage overhead.

### Summary table

| Measurement                                | Average or total |  Peak |
| ------------------------------------------ | ---------------: | ----: |
| Daily active users                         |        1,000,000 |     — |
| Photo uploads per second                   |               10 |    50 |
| Feed views per second                      |              500 | 2,500 |
| Original photo storage per year            |           730 TB |     — |
| Thumbnail storage per year                 |         18.25 TB |     — |
| Total photo and thumbnail storage per year |        748.25 TB |     — |

## 3. Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users view 50 feed pages per day but upload only one photo per day.

Daily feed views = 50,000,000.

Daily photo uploads = 1,000,000.

This means feed views occur approximately 50 times as often as photo uploads.

The design should therefore prioritize fast feed delivery and reducing repeated database queries. A cache can store frequently requested feed data, a database read replica can handle read queries, and a CDN can deliver photo files from locations close to users.

Photo uploads still need reliable storage and processing, but feed reads are expected to create the greater request load.

## 4. Why Photos Should Not Be Stored Inside the Database

Original photos and thumbnails should be stored in object storage rather than directly inside the main database.

SnapShare is expected to generate approximately 748.25 TB of new photo and thumbnail data each year. Storing all these files directly in the database would increase its size, complicate backups, and make database operations more expensive and difficult to manage.

Object storage is designed to store large files efficiently and scale as the number of photos grows. The database should store photo metadata, ownership, timestamps, captions, and object-storage keys or URLs instead of the actual image files.

## 5. Architecture Diagram

```text
                         USERS
                           |
                           v
                        DNS
                           |
                           v
                          CDN
                   (Static files and
                    cached thumbnails)
                           |
                           v
                    LOAD BALANCER
                           |
              +------------+------------+
              |            |            |
              v            v            v
          APP SERVER 1  APP SERVER 2  APP SERVER N
              |            |            |
              +------------+------------+
                           |
              +------------+-------------+
              |            |             |
              v            v             v
            CACHE       PRIMARY DB    OBJECT STORAGE
          (Redis)          |         (Original photos
                            |          and thumbnails)
                            v                  ^
                      READ REPLICA              |
                                               |
              APP SERVER                        |
                   |                            |
                   v                            |
              MESSAGE QUEUE                     |
                   |                            |
                   v                            |
              THUMBNAIL WORKER -----------------+
              (Creates thumbnail and
               saves it to object storage)
```

The application servers communicate with the cache, database, object storage, and message queue as required.

The thumbnail worker reads queued jobs, retrieves the original photo from object storage, creates a smaller thumbnail, and saves it back to object storage.

## 6. Components and the Problems They Solve

- **DNS:** Translates SnapShare's domain name into the appropriate network address so users can reach the application.
- **CDN:** Delivers static website files and cached photo thumbnails from locations close to users, reducing latency and origin-server load.
- **Load balancer:** Distributes incoming API requests across healthy application servers to prevent one server from receiving all the traffic.
- **App servers:** Handle API requests, authenticate users, validate uploads, manage feed requests, and coordinate database and storage operations.
- **Cache (Redis):** Stores frequently requested feed data and other reusable information in memory to reduce repeated database queries and improve response times.
- **Primary database:** Stores authoritative records such as user accounts, photo metadata, captions, ownership, and relationships between users.
- **Database read replica:** Handles suitable read queries so the primary database has more capacity for writes and other important operations.
- **Object storage:** Stores original photo files and generated thumbnails separately from the database, allowing photo storage to scale efficiently.
- **Message queue:** Holds thumbnail-generation jobs until a worker can process them, preventing image processing from delaying the upload response.
- **Thumbnail worker:** Processes queued jobs, creates smaller versions of uploaded photos, and stores the resulting thumbnails in object storage.

## 7. Step-by-Step Photo Upload Flow

1. **User selects a photo:** The user chooses a photo and submits it through the SnapShare application.

2. **Request reaches the load balancer:** The request passes through the appropriate network entry point and is routed to a healthy application server.

3. **Application validates the upload:** The application authenticates the user and checks the file type, file size, and upload permissions.

4. **Original photo is stored:** The application stores the original image in object storage and obtains its object key or URL.

5. **Photo metadata is saved:** The application writes the photo's metadata, owner, caption, and object-storage reference to the primary database.

6. **Thumbnail job is queued:** The application places a thumbnail-generation job in the message queue, including the information needed to locate the original photo.

7. **Upload confirmation is returned:** Once the original photo and its metadata have been saved successfully and the job has been queued, the application returns a successful response to the user. Thumbnail generation can continue asynchronously.

8. **Worker processes the job:** A thumbnail worker retrieves the queued job and downloads or reads the original photo from object storage.

9. **Thumbnail is generated:** The worker resizes the original photo into a smaller thumbnail, reducing the amount of data required to display it in a feed.

10. **Thumbnail is stored:** The worker saves the thumbnail in object storage and records or updates its reference in the database if necessary.

11. **Feed displays the photo:** When followers view their feeds, the application retrieves the relevant photo metadata and returns references to the original photo or thumbnail. Frequently requested feed data can come from Redis, and photo files can be delivered through the CDN.

## 8. Trade-Offs

### Trade-Off 1: Caching versus Freshness

Caching feed data improves response times and reduces database load. However, a cached feed may not immediately reflect a newly uploaded photo or a change in a user's follow relationships.

SnapShare can use cache expiration and invalidation to balance speed with freshness. Important changes should invalidate or update the relevant cache entries.

### Trade-Off 2: Database Read Replicas versus Consistency

Read replicas distribute read traffic and reduce the load on the primary database. However, replication lag can cause a replica to return slightly outdated information.

SnapShare can use replicas for ordinary feed reads while sending operations that require the latest confirmed data to the primary database.

### Trade-Off 3: Asynchronous Thumbnail Generation versus Immediate Availability

Using a message queue and worker allows the upload request to finish without waiting for thumbnail generation. This improves the upload experience and helps absorb traffic bursts.

However, the thumbnail may not be available immediately after upload. SnapShare can temporarily display the original photo or a placeholder until the thumbnail is ready, and it should retry failed thumbnail jobs.

### Trade-Off 4: Object Storage versus Simplicity

Object storage handles large volumes of image files more efficiently than storing the files directly in a relational database. It also allows photo storage to grow independently of database capacity.

However, this architecture introduces extra components and requires the application to coordinate file uploads, metadata writes, permissions, and cleanup when an upload fails.

## Conclusion

SnapShare has 1 million daily active users, approximately 10 average photo uploads per second, and 500 average feed views per second. Peak traffic is estimated at 50 uploads and 2,500 feed views per second.

The system is read-heavy, so the architecture prioritizes fast feed reads through caching, read replicas, and a CDN. Original photos and thumbnails are stored in object storage, while a message queue and background worker handle thumbnail generation. This architecture supports growth while balancing performance, consistency, reliability, and operational complexity.

## 12. Step-by-Step Photo Upload Flow

The photo upload process should use object storage and a message queue so that large image files do not have to pass through application servers for every operation. Image processing happens asynchronously, allowing the application to respond quickly while background workers handle the heavier tasks.

### Upload Flow

1. **User selects a photo.** The browser checks basic requirements, such as the permitted file type and maximum file size, before starting the upload.

2. **Browser requests permission to upload.** The browser sends an authenticated request to the application API asking for an upload URL. The request includes the file name, content type, and file size.

3. **API validates the request.** The API checks the user's authentication, authorization, file limits, and allowed image formats. Invalid requests are rejected before storage resources are allocated.

4. **API creates a pending database record.** The database stores the photo ID, owner ID, upload status, and relevant metadata. The initial status is `PENDING_UPLOAD`.

5. **API generates a temporary upload URL.** The API returns a short-lived, pre-signed object-storage URL. The URL permits the intended upload without exposing permanent storage credentials to the browser.

6. **Browser uploads directly to object storage.** The browser sends the image bytes to the storage service using the temporary URL. This reduces bandwidth and processing pressure on the application servers.

7. **Browser confirms the upload.** After the storage service reports success, the browser calls the API's upload-completion endpoint with the photo ID and upload identifier.

8. **API verifies the stored object.** The API checks that the expected object exists and that its size and metadata meet the required constraints. The database record is updated to `UPLOADED`.

9. **API places a processing message on the queue.** The message contains the photo ID and the storage object key, not the image bytes themselves. The queue provides durable work delivery and absorbs traffic spikes.

10. **A background worker receives the message.** The worker retrieves the original image from object storage, performs deeper validation, and generates required image sizes, such as thumbnails and feed-sized images.

11. **Worker stores the processed images.** The generated image variants are saved to object storage. The worker updates the database with their object keys and changes the photo status to `READY`.

12. **Application serves the photo.** The API returns the photo's metadata and image URLs to authorized clients. A CDN can cache and deliver image variants from locations closer to users.

13. **Failures are handled safely.** Transient processing failures are retried. After a configured retry limit, a message can be moved to a dead-letter queue for investigation. Workers should be idempotent so that processing the same message twice does not create inconsistent records or duplicate logical results.

### Important Upload States

A photo may move through the following states:

`PENDING_UPLOAD → UPLOADED → PROCESSING → READY`

If an operation fails, the system can record an appropriate `FAILED` state and error details. Retriable processing failures should not be treated as permanent failures until the retry policy is exhausted.

### Why Use a Queue?

Image resizing and validation can take longer than a normal API request. Sending this work to a queue allows the API to acknowledge the upload without waiting for every image variant to be generated. The queue also buffers bursts of uploads, while the number of workers can be increased when processing demand grows.

The application must not mark a photo as `READY` until its required image variants have been stored successfully. Queue messages should identify the photo and its storage location rather than carrying large image files.

## 13. Architectural Trade-offs

### Trade-off 1: Asynchronous Queue Processing vs. Synchronous Processing

**Chosen approach:** Use a queue and background workers to process uploaded photos asynchronously.

**Benefits:**

- Upload requests return sooner because users do not wait for image resizing.
- Worker capacity can scale independently of API capacity.
- The queue absorbs sudden bursts of uploads and allows failed jobs to be retried.
- Slow image processing does not occupy application request handlers for long periods.

**Costs and limitations:**

- A photo may take several seconds or longer to become available in its processed form.
- The application must track processing states and communicate them to users.
- Queues, workers, retries, monitoring, and dead-letter handling add operational complexity.
- Duplicate messages are possible, so workers must handle repeated processing safely.

**Decision:** Asynchronous processing is appropriate because photo processing is resource-intensive and can be completed after the upload request. The interface should show a processing state until the photo is ready.

### Trade-off 2: Direct-to-Object-Storage Uploads vs. Uploads Through Application Servers

**Chosen approach:** Let the browser upload image bytes directly to object storage using a short-lived, pre-signed URL.

**Benefits:**

- Large image transfers do not consume application-server bandwidth.
- Application servers can focus on authentication, metadata, and business logic.
- Object storage is designed to store large files reliably and can scale independently.
- The architecture can support higher upload traffic without proportionally increasing API-server capacity.

**Costs and limitations:**

- The API must safely generate and manage temporary upload permissions.
- The application needs a completion endpoint to verify that the upload actually succeeded.
- Uploads can be abandoned, leaving pending database records or unused objects.
- Direct uploads require careful validation, access controls, expiration policies, and cleanup jobs.

**Decision:** Direct uploads are preferable for a photo application expected to grow because they separate large file transfers from normal API traffic. The API remains responsible for authorization, validation, metadata, and upload-state management. Temporary upload URLs should be restricted to the intended object and allowed operation.

## 14. Final Scaling Principle

The architecture separates responsibilities:

- **CDN:** Delivers frequently requested image variants close to users.
- **Application servers:** Authenticate requests and manage photo metadata.
- **Database:** Stores users, photo records, permissions, and processing states.
- **Object storage:** Holds original photos and generated variants.
- **Message queue:** Buffers image-processing tasks and supports retries.
- **Background workers:** Validate images and generate the required variants.

This separation allows each component to scale according to its own workload. It also introduces more moving parts, so production readiness requires monitoring, access controls, retry policies, cleanup procedures, and clear handling of failed uploads.

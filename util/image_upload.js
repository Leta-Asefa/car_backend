import cloudinary from "../config/cloudinary";

const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

export async function UploadImages(params) {
  try {
    const uploadPromises = req.files.map((file) => streamUpload(file.buffer));
    const results = await Promise.all(uploadPromises);

    const imageUrls = results.map((result) => result.secure_url);
    return [true, imageUrls];
  } catch (err) {
    return [false, []];
  }
}

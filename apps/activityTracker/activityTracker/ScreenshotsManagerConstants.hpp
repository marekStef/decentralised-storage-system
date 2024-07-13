#ifndef _SCREENSHOTS_MANAGER_CONSTANTS_
#define _SCREENSHOTS_MANAGER_CONSTANTS_

constexpr char SERVER_UPLOADS_ENDPOINT[] = "http://localhost:3000/uploads"; // -NOTE: This is not currently used


constexpr char INVALID_OUTPUT_DIR_MESSAGE[] = "Output directory path cannot be null.";
constexpr char FAILED_TO_COPY_OUTPUT_DIR_STR_MESSAGE[] = "Failed to copy output directory path.";
constexpr char PARAMETER_NULL_MESSAGE[] = "Parameter cannot be nullptr.";
constexpr char FAILED_TO_GET_IMAGE_ENCODERS_MESSAGE[] = "Failed to get image encoder size or no encoders available.";
constexpr char FAILED_TO_GET_IMAGE_ENCODER_MESSAGE[] = "Failed to get image encoder.";
constexpr char BIT_BLT_FAILED_MESSAGE[] = "BitBlt failed.";
constexpr char FAILED_TO_GET_DEVICE_CONTEXT_MESSAGE[] = "Failed to get the screen device context.";
constexpr char COMPATIBLE_BITMAP_CREATE_FAILED_MESSAGE[] = "Failed to create a compatible bitmap.";
constexpr char SELECTION_OF_BITAMAP_TO_DC_FAILED_MESSSAGE[] = "Failed to select the bitmap into the device context.";
constexpr char FAILED_TO_SAVE_BITMAP_MESSAGE[] = "Bitamp could not be saved.";
#endif // !_SCREENSHOTS_MANAGER_CONSTANTS_


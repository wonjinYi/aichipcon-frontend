import cv2
import numpy as np
import onnxruntime
import torch
import torchvision
from pathlib import Path
from ultralytics import YOLO


# yolo export model=yolov5su.pt format=onnx
class CPURuntime:
    def __init__(self, onnx_model_path="yolov5su.onnx"):
        # Set YOLO input size
        self.input_width = 640
        self.input_height = 640
        self.conf_thres = 0.2
        self.iou_thres = 0.6

        # Load the ONNX model
        onnx_model_path = Path(__file__).parent / onnx_model_path
        print("Loading ONNX model:", onnx_model_path)
        self.session = onnxruntime.InferenceSession(onnx_model_path)

        self.model = YOLO("yolov5su.pt")

    # def run_frame_with_yolo(self, frame):
    #     results = self.model(frame, device="mps", verbose=False)
    #     result = results[0]
    #     for box in result.boxes:
    #         out = {"cls": box[5], "conf": box[4], "xywh": box[:4]}
    #         print(out)

    def run_frame(self, frame):
        # Preprocess the frame
        input_tensor = self._preprocess(frame)

        # Get model input/output information
        input_name = self.session.get_inputs()[0].name
        output_name = self.session.get_outputs()[0].name

        # Perform inference
        outputs = self.session.run([output_name], {input_name: input_tensor})

        # Post-process the outputs
        return self._postprocess(outputs)

    # def _resize(self, image, size):
    #     pass

    # Function to perform preprocessing
    def _preprocess(self, image):
        resized = cv2.resize(image, (self.input_width, self.input_height))
        normalized = resized / 255.0  # Normalize to [0, 1]
        transposed = np.transpose(normalized, (2, 0, 1))  # HWC to CHW
        return np.expand_dims(transposed.astype(np.float32), axis=0)

    # Function to perform post-processing
    def _postprocess(self, outputs):
        outputs = outputs[0]
        boxes = outputs[:, :4]  # (1, 4, 8400)
        # get the class id
        labels = outputs[:, 4:].argmax(axis=1)
        # get the max confidence
        confidences = outputs[:, 4:].max(axis=1)
        # print(boxes.shape, confidences.shape, labels)

        # convert ndarray to tensor and do torchvision nms
        boxes = torch.tensor(boxes).reshape(-1, 4)
        scores = torch.tensor(confidences).reshape(-1)
        labels = torch.tensor(labels).reshape(-1)
        # filter out only high confidence boxes
        tmp_tensor = torch.cat((boxes, scores.unsqueeze(1), labels.unsqueeze(1)), dim=1)
        tmp_tensor = tmp_tensor[tmp_tensor[:, 4] > self.conf_thres]
        boxes = tmp_tensor[:, :4]
        scores = tmp_tensor[:, 4]
        labels = tmp_tensor[:, 5]
        # print(boxes.shape, scores.shape, labels.shape)

        # Apply non-maximum suppression (NMS)
        indices = torchvision.ops.nms(boxes, scores, self.iou_thres)

        # Filter boxes, scores, and labels based on NMS results
        boxes = boxes[indices].numpy()
        scores = scores[indices].numpy()
        # print(sorted(scores, reverse=True))

        # Iterate through detections and create a dictionary for each detection
        result = []
        for box, score, label in zip(boxes, scores, labels):
            # print(box, score, label)
            box /= 640
            d = dict(
                zip(
                    # ["x1", "y1", "x2", "y2", "conf", "class_id"],
                    # box.tolist() + [int(score), int(label)],
                    ["cls", "conf", "xywh"],
                    [int(label), float(score), list(map(float, box.tolist()))],
                )
            )
            # print(d)
            result.append(d)
        return result

import cv2
import torch
import torchvision
from ultralytics.utils import ops


def load_dnxx_session(model_path="/home/orangepi/dx_app/example/YOLOV5S_3/graph.dxnn"):
    from dx_engine import InferenceEngine  # custom onnx runtime

    return InferenceEngine(model_path)


def load_cpu_onxx_session(
    cpu_model_path="/home/orangepi/dx_app/example/YOLOV5S_3/cpu_0.onnx",
):
    import onnxruntime as ort

    return ort.InferenceSession(cpu_model_path)


def letter_box(
    image_src, new_shape=(512, 512), fill_color=(114, 114, 114), format=None
):
    src_shape = image_src.shape[:2]  # height, width
    if isinstance(new_shape, int):
        new_shape = (new_shape, new_shape)
    r = min(new_shape[0] / src_shape[0], new_shape[1] / src_shape[1])

    ratio = r, r
    new_unpad = int(round(src_shape[1] * r)), int(round(src_shape[0] * r))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]

    dw /= 2
    dh /= 2

    if src_shape[::-1] != new_unpad:
        image_src = cv2.resize(image_src, new_unpad, interpolation=cv2.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    image_new = cv2.copyMakeBorder(
        image_src, top, bottom, left, right, cv2.BORDER_CONSTANT, value=fill_color
    )  # add border
    if format is not None:
        image_new = cv2.cvtColor(image_new, format)

    return image_new, ratio, (dw, dh)


def do_post(ort_output, conf_thres=0.3, iou_thres=0.4):
    x = torch.Tensor(ort_output[0][0])
    # print(">>>>>x.shape::::",x.shape)
    x = x[x[..., 4] > conf_thres]
    box = ops.xywh2xyxy(x[:, :4])
    x[:, 5:] *= x[:, 4:5]
    conf, j = x[:, 5:].max(1, keepdims=True)
    x = torch.cat((box, conf, j.float()), 1)[conf.view(-1) > conf_thres]
    x = x[x[:, 4].argsort(descending=True)]
    x = x[torchvision.ops.nms(x[:, :4], x[:, 4], iou_threshold=iou_thres)]
    # print("[Result] Detected {} Boxes.".format(len(x)))

    boxes = []
    for idx, r in enumerate(x.numpy()):
        xyxy = (r[0:4]/512)
        print(xyxy)
        xywh = [xyxy[0], xyxy[1], xyxy[2]-xyxy[0],xyxy[3]-xyxy[1]]
        conf = float(r[4])
        cls_ = r[5].astype(int)
        # print("[{}] conf, classID, x1, y1, x2, y2, : {:.4f}, {}({}), {}, {}, {}, {}"
        #         .format(idx, conf, classes[label], label, pt1[0], pt1[1], pt2[0], pt2[1]))
        d = dict(
            zip(
                "conf, cls, xywh".split(", "),
                [float(conf), int(cls_), list(map(float, xywh))]
            )
        )
        boxes.append(d)
    return boxes


class NPURuntime:
    def __init__(self):
        # load dnxx, onxx runtime
        self.ie = load_dnxx_session()
        self.sess = load_cpu_onxx_session()
        self.input_width = 512
        self.input_height = 512
        self.conf_thres = 0.3
        self.iou_thres = 0.4

    def run_frame(self, frame):
        # preprocessing: fit image into square
        image_input, _, _ = letter_box(
            frame,
            new_shape=(self.input_width, self.input_height),
            fill_color=(114, 114, 114),
            format=cv2.COLOR_BGR2RGB,
        )
        # inference: (1) run dxrt inference engine,
        npu_output = self.ie.run(image_input)
        # inference: (2) run onnx session for decoding
        input_names = [input.name for input in self.sess.get_inputs()]
        assert len(npu_output) == len(
            self.sess.get_inputs()
        ), "npu_output and sess.get_inputs() length does not match"
        input_dict = {
            input_names[0]: npu_output[0],
            input_names[1]: npu_output[1],
            input_names[2]: npu_output[2],
        }
        ort_output = self.sess.run(None, input_dict)
        # TODO: move do_post to this class
        boxes = do_post(ort_output, self.conf_thres, self.iou_thres)
        return boxes

import torch
import torch.nn as nn
from PIL import Image
from torchvision.transforms import transforms
from torchvision import models


trained_model = None
class_names= ['F_Breakage', 'F_Crushed', 'F_Normal', 'R_Breakage', 'R_Crushed', 'R_Normal']

class ResNetCNNModel(nn.Module):

  def __init__(self):
    super().__init__()

    self.model= models.resnet50(weights='DEFAULT')

    for param in self.model.parameters():
      param.requires_grad=False

    for param in self.model.layer4.parameters():
      param.requires_grad=True

    self.model.fc= nn.Sequential(
        nn.Dropout2d(p=0.2),
        nn.Linear(self.model.fc.in_features,6)
    )


  def forward(self,features):
    return self.model(features)



def predict(image_path):
    global trained_model

    image= Image.open(image_path).convert("RGB")

    transform= transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],std=[0.229, 0.224, 0.225])]
    )
    image_tensor= transform(image).unsqueeze(0)

    if trained_model is None:
        trained_model= ResNetCNNModel()
        trained_model.load_state_dict(torch.load("model/saved_model.pth", map_location=torch.device('cpu')))
        trained_model.eval()

    with torch.no_grad():
        output= trained_model(image_tensor)
        _, predicted= torch.max(output,1)

        return class_names[predicted.item()]

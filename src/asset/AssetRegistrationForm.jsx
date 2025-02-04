import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Divider,
  Upload,
  message,
  Modal,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const AssetRegistrationForm = () => {
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const [subTypes, setSubTypes] = useState([]);
  const [qrCodeModalVisible, setQrCodeModalVisible] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  const handleChange = ({ fileList }) => {
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result;
        setPreviewImage(base64String);
      };
    } else {
      setPreviewImage(null);
    }
  };

  const onAssetTypeChange = (value) => {
    let subTypeOptions = [];
    switch (value) {
      case "sanitizedType":
        subTypeOptions = [
          "Manpower Deployment",
          "Cleaning and Sanitation",
          "Facility Maintenance",
          "Accessibility",
          "Waste Management",
        ];
        break;
      case "tentageType":
        subTypeOptions = ["Tentage Issues", "Furniture Items"];
        break;
      default:
        subTypeOptions = [];
    }
    setSubTypes(subTypeOptions);
    form.setFieldsValue({ assetSubType: undefined });
  };

  const onFinish = async (values) => {
    // Remove assetSubType from the payload
    delete values.assetSubType;

    try {
      const response = await fetch(
        "http://filemanagement.metaxpay.in:8001/create-asset/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setQrCodeData(result);
        setQrCodeModalVisible(true);
        message.success("Asset registered successfully!");
        form.resetFields();
        setPreviewImage(null);
      } else {
        throw new Error("Failed to register asset");
      }
    } catch (error) {
      message.error(
        error.message || "An error occurred while registering the asset."
      );
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-md rounded-lg mt-3 w-full">
      <div className="text-d9 text-2xl flex items-end justify-between">
        <div className="font-bold">Asset Registration</div>
        <div className="text-xs">All * marked fields are mandatory</div>
      </div>
      <Divider className="bg-d9 h-2/3 mt-1"></Divider>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          assetType: "Toilets & Sanitation",
          vendor: "Vendor 1",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">
          <Form.Item
            label={<div className="font-semibold">Assets Name</div>}
            name="asset_name"
            rules={[{ required: true, message: "Please enter Assets Name" }]}
            className="mb-4"
          >
            <Input placeholder="Enter Assets Name" className="rounded-none" />
          </Form.Item>
          <Form.Item
            label={<div className="font-semibold">Vendor</div>}
            name="vendor"
            rules={[{ required: true, message: "Please select a Vendor" }]}
            className="mb-4"
          >
            <Select placeholder="Select Vendor" className="rounded-none">
              <Option value="Vendor 1">Vendor 1</Option>
              <Option value="Vendor 2">Vendor 2</Option>
              <Option value="Vendor 3">Vendor 3</Option>
              <Option value="Vendor 4">Vendor 4</Option>
              <Option value="Vendor 5">Vendor 5</Option>
            </Select>
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">
          <Form.Item
            label={<div className="font-semibold">Asset Type</div>}
            name="asset_type"
            rules={[{ required: true, message: "Please select an Asset Type" }]}
            className="mb-4"
          >
            <Select
              placeholder="Select Asset Type"
              className="rounded-none"
              onChange={onAssetTypeChange}
            >
              <Option value="sanitizedType">Toilets & Sanitation</Option>
              <Option value="tentageType">Tentage & Furniture</Option>
              {/* Add more options as needed */}
            </Select>
          </Form.Item>

          <Form.Item
            label={<div className="font-semibold">Asset Sub Type</div>}
            name="assetSubType"
            rules={[
              { required: true, message: "Please select an Asset Sub Type" },
            ]}
            className="mb-4"
          >
            <Select
              placeholder="Select Asset Sub Type"
              className="rounded-none"
            >
              {subTypes.map((subType, index) => (
                <Option key={index} value={subType}>
                  {subType}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 gap-x-5">
          <Form.Item
            label={<div className="font-semibold">Assets Description</div>}
            name="asset_desc"
            className="mb-4"
          >
            <TextArea rows={2} placeholder="Enter Assets Description" />
          </Form.Item>
        </div>
        {/* <div className="grid grid-cols-1 gap-x-5">
          <Form.Item
            name="photo"
            label="Photo of Assets"
            valuePropName="fileList"
            getValueFromEvent={(e) => e.fileList}
          >
            <Upload
              onChange={handleChange}
              beforeUpload={() => false} // Prevent automatic upload
            >
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </Form.Item>
        </div> */}
        <div className="flex justify-end">
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-fit rounded-none bg-5c"
            >
              Register
            </Button>
          </Form.Item>
        </div>
      </Form>

      <Modal
        title="Asset Registered Successfully"
        width={400}
        visible={qrCodeModalVisible}
        onCancel={() => setQrCodeModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrCodeModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {qrCodeData && (
          <div className="text-center">
            <p>
              <strong>Asset Name:</strong> {qrCodeData.asset_name}
            </p>
            <p>
              <strong>Asset Code:</strong> {qrCodeData.asset_code}
            </p>
            <div className="flex w-full justify-center items-center">
              {qrCodeData.qr_image && (
                <img
                  src={`http://filemanagement.metaxpay.in:8001${qrCodeData.qr_image}`}
                  alt="QR Code"
                  style={{ width: "200px", height: "200px" }}
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssetRegistrationForm;

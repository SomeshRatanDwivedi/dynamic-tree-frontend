import axios from "axios"
import type { TreeNodeData } from "../components/TreeNode";


const baseUrl=import.meta.env.VITE_API_BASE_URL
export const getTreeData = async () => {
  const res = await axios.get(`${baseUrl}/tree/`);
  return res.data;
}

export const updateTreeData = async (treeData:TreeNodeData) => {
  const res = await axios.put(`${baseUrl}/tree/update-tree`, treeData);
  return res.data;
}

export const saveTreeData = async (treeData:Partial<TreeNodeData>) => {
  const res = await axios.post(`${baseUrl}/tree/save-new-tree`,treeData);
  return res.data;
}

export const deletTreeData = async (treeId:string) => {
  const res = await axios.delete(`${baseUrl}/tree/delete-tree/${treeId}`);
  return res.data;
}
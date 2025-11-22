import { useEffect, useState } from "react"
import { deletTreeData, getTreeData, saveTreeData } from "./api";
import { TreeNode, type TreeNodeData } from "./components/TreeNode";


function App() {
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);


  const createNewNode = (node: TreeNodeData) => {
    const childLength = node.children.length;
    const newChildId = `${node.id}.${childLength + 1}`;
    const newChildName = `${node.name}-child-${childLength + 1}`;
    const newChild: TreeNodeData = {
      id: newChildId,
      name: newChildName,
      data: newChildName,
      children: [],
    };
    return newChild;
  }

  const addChild = (parentId: string, topParentId: string) => {
    const currTree = treeData.find(tree => tree.id === topParentId);
    if (!currTree) {
      console.error("Top parent tree not found");
      return;
    }
    const updateTree = (node: TreeNodeData): TreeNodeData => {
      if (node.id === parentId) {
        if (node.data) {
          node.data = "";
        }
        return {
          ...node,
          children: [...node.children, createNewNode(node)],
        };
      }
      return {
        ...node,
        children: node.children.map(updateTree),
      };
    };
    const updatedTree = updateTree(currTree);
    setTreeData(prev => prev.map(tree => tree.id === topParentId ? updatedTree : tree));
  };

  const updateNode = (nodeId: string, field: "name" | "data", value: string, topParentId: string) => {
    const currTree = treeData.find(tree => tree.id === topParentId);
    if (!currTree) {
      console.error("Top parent tree not found");
      return;
    }
    const updateTree = (node: TreeNodeData): TreeNodeData => {
      if (node.id === nodeId) {
        return {
          ...node,
          [field]: value,
        };
      }
      return {
        ...node,
        children: node.children.map(updateTree),
      };
    };
    const updatedTree = updateTree(currTree);
    setTreeData(prev => prev.map(tree => tree.id === topParentId ? updatedTree : tree));
  };

  const addNewRootTree = async () => {
    const newTreeId = (treeData.length + 1).toString();
    const newTreeName = `Root-${newTreeId}`;
    const newTree: Partial<TreeNodeData> = {
      name: newTreeName,
      data: newTreeName,
      children: [],
    };
    try {
      const savedTree = await saveTreeData(newTree);
      newTree.id = savedTree.id+"";
      setTreeData(prev => [...prev, newTree as TreeNodeData]);
    } catch (err) {
      console.log("err in saving new root tree", err);
    }
  }


  const onDeleteNode = async (nodeId: string, topParentId: string, currNodeParentId?:string) => {
    try {
      if (nodeId === topParentId) {
        setTreeData(prev => prev.filter(tree => tree.id !== nodeId));
        await deletTreeData(nodeId);
        return;
      }
    const currTree = treeData.find(tree => tree.id === topParentId);
    if (!currTree) {
      console.error("Top parent tree not found");
      return;
    }
      if (!currNodeParentId) {
        console.error("Current node parent ID is required to delete a non-root node");
        return;
      }
    const updateTree = (node: TreeNodeData): TreeNodeData => {
      if (node.id === currNodeParentId) {
        return {
          ...node,
          children: [node.children.filter(child => child.id !== nodeId)].flat(),
        };
      }
      return {
        ...node,
        children: node.children.map(updateTree),
      };
    };
    const updatedTree = updateTree(currTree);
    setTreeData(prev => prev.map(tree => tree.id === topParentId ? updatedTree : tree));

    } catch (err) {
      console.log("err in deleting tree/node", err);
    }

  };

  useEffect(() => {
    const getTreeStructure = async () => {
      try {
        const res = await getTreeData();
        setTreeData(res);
      } catch (err) {
        console.log("err in getting tree structure", err);
      }
    }
    getTreeStructure()
  }, [])
  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <button onClick={addNewRootTree} className="mr-2 mx-auto mb-6 cursor-pointer border px-4 py-2 rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity">
        Add new tree
      </button>
      <span><b>Note: </b> To delete child node you have to delete and click on export button</span>
      <div className="bg-[hsl(var(--card))] rounded-lg p-6 shadow-sm">
        {
          treeData.map((treeData) => (
            <div key={treeData.id} className="mb-6">
              <TreeNode topParentId={treeData.id} node={treeData} onAddChild={addChild} onUpdateNode={updateNode} onDeleteNode={onDeleteNode} />
            </div>
          ))
        }
      </div>

    </div>
  );
}

export default App

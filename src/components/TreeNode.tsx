import { useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { updateTreeData } from "../api";

export interface TreeNodeData {
  id: string;
  name: string;
  data: string;
  children: TreeNodeData[];
}

interface TreeNodeProps {
  node: TreeNodeData;
  onAddChild: (parentId: string, topParentId: string) => void;
  onDeleteNode: (parentId: string, topParentId: string, currNodeParentId?:string) => void;
  onUpdateNode: (nodeId: string, field: "name" | "data", value: string, topParentId: string) => void;
  depth?: number;
  topParentId: string;
  currNodeParentId?: string;
}

export const TreeNode = ({ node, onAddChild, onUpdateNode, depth = 0, topParentId, onDeleteNode,currNodeParentId }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [jsonData, setJsonData] = useState<string>("");
  const hasChildren = node.children.length > 0;

  const exportTree = async () => {
    const jsonString = JSON.stringify(node, null, 2);
    setJsonData(jsonString);
    try {
      await updateTreeData(node);
    } catch (err) {
      console.log("err in exporting tree data", err);
    }
  };

  return (
    <>
      <div className={"select-none border-2 border-(--tree-node) border-t-white" + (depth > 0 && " ml-8 border-r-0 border-b-0")}>
        <div
          className="flex items-center gap-2 p-2 bg-(--tree-node) transition-colors">
          {hasChildren && <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0 w-10 h-8 flex items-center justify-center rounded transition-colors bg-white cursor-pointer"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {
              isExpanded ? (
                <FaAngleDown className="w-4 h-4 border-0" />
              ) : (
                <FaAngleRight className="w-4 h-4 border-0" />
              )
            }
          </button>
          }

          <input
            value={node.name}
            name="name"
            onChange={(e) => onUpdateNode(node.id, "name", e.target.value, topParentId)}
            className="flex-1 h-8 font-medium pl-2 bg-background/50 border rounded-sm"
          />

          <button
            onClick={() => onAddChild(node.id, topParentId)}
            className="shrink-0 h-8 text-sm w-25 bg-white cursor-pointer font-semibold"
          >
            Add Node
          </button>
          <button
            onClick={() => onDeleteNode(node.id, topParentId, currNodeParentId)}
            className="shrink-0 h-8 text-sm w-25 bg-red-400 text-white cursor-pointer font-semibold"
          >
            {node.id === topParentId ? "Delete Tree" : "Delete Node" }
          </button>
        </div>

        {!hasChildren && <div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-md text-muted-foreground font-medium">Data</span>
            <input
              value={node.data}
              name="data"
              onChange={(e) => onUpdateNode(node.id, "data", e.target.value, topParentId)}
              className="h-10 bg-background border border-(--tree-node) rounded-sm p-2 w-1/2"
              placeholder="Enter data..."
            />
          </div>
        </div>}

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                onAddChild={onAddChild}
                onUpdateNode={onUpdateNode}
                depth={depth + 1}
                topParentId={topParentId}
                onDeleteNode={onDeleteNode}
                currNodeParentId={node.id}
              />
            ))}
          </div>
        )}

      </div>
      {node.id === topParentId && <> <div className="mt-6 pt-4">
        <button onClick={exportTree} className="cursor-pointer border px-4 py-2 rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity">
          Export
        </button>
      </div>

        {jsonData && (
          <div className="mt-6 p-4 bg-[hsl(var(--card))] rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2">Exported JSON:</h2>
            <pre className="max-h-96 overflow-auto bg-[hsl(var(--background))] p-4 rounded-sm border border-[hsl(var(--border))]">
              <code>{jsonData}</code>
            </pre>
          </div>
        )
        }
      </>
      }
    </>
  );
};

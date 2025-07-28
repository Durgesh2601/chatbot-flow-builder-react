import { useCallback, useState } from "react";
import {
  ReactFlow,
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodesPanel from "./components/NodesPanel";
import Topbar from "./components/Topbar";
import "./App.css";
import CustomAlert from "./components/CustomAlert";
import nodeTypes from "./config/nodeTypes";
import { initialNodes } from "./constants";
import { getId } from "./utils";

const initialEdges = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDragStop = (event, node) =>
    setNodes((nds) => nds.map((n) => (n.id === node.id ? node : n)));

  const onNodesDelete = (selectedNodes) => {
    const newNodes = nodes.filter((node) => !selectedNodes.includes(node.id));
    const newEdges = edges.filter(
      (edge) =>
        !selectedNodes.includes(edge.source) &&
        !selectedNodes.includes(edge.target)
    );
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow");
    // check if the dropped element is valid
    if (typeof type === "undefined" || !type) {
      return;
    }
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const id = getId(nodes);
    const newNode = {
      id,
      type,
      position,
      data: { label: `${type} ${id}` },
    };
    setNodes((prevNodes) => prevNodes.concat(newNode));
  };

  const handleUpdateNodeLabel = (nodeId, label) => {
    const mappedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            label,
          },
        };
      }
      return node;
    });
    setNodes(mappedNodes);
    setSelectedNode(null);
  };

  const closeAlert = () => {
    setAlertMessage("");
  };

  const handleSave = useCallback(() => {
    const nodesWithoutTarget = nodes.filter(
      (node) => !edges.find((edge) => edge.source === node.id)
    );
    if (nodesWithoutTarget.length > 1) {
      setAlertMessage(
        "Cannot save flow! More than one node with empty target handles"
      );
    } else {
      setAlertMessage("Flow saved successfully!");
      console.log("Flow saved");
    }
  }, [nodes]);

  return (
    <div className="App">
      <Topbar handleSave={handleSave} />
      <div className="flow-builder">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          elements={[...nodes, ...edges]}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={(event, node) => setSelectedNode(node)}
          onNodesDelete={onNodesDelete}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
        >
          <Controls />
          <Background />
        </ReactFlow>
        <NodesPanel
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          handleUpdateNodeLabel={handleUpdateNodeLabel}
        />
        {alertMessage && (
          <CustomAlert message={alertMessage} onClose={closeAlert} />
        )}
      </div>
    </div>
  );
}

export default App;

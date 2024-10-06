import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { AppType } from "../logic/types";
import { useTheme } from "@mui/material";

export default DragContainer;
function DragContainer({
  apps,
  buildCard,
  onEnd,
}: {
  apps: AppType[];
  buildCard: Function;
  onEnd: (d: DropResult<string>) => void;
}) {
  useEffect(() => {
    setItems(apps);
  }, [apps]);
  // fake data generator
  const baseItems = ["blog", "chat", "forum", "radio", "wiki"];
  const theme = useTheme();

  // a little function to help us with reordering the result

  const grid = 5;

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    margin: `0 ${grid * 2}px 0 0`,

    // change background colour if dragging
    background: isDragging ? theme.palette.warning.light : "grey",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? theme.palette.secondary.light : "grey",
    display: "flex",
    padding: grid,
    overflow: "auto",
    height: "100%",
  });

  const [items, setItems] = useState(baseItems);

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  return (
    <DragDropContext onDragEnd={onEnd}>
      <Droppable droppableId="droppable" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            {items.map((item, index) => (
              <Draggable
                isDragDisabled={item === "static/"}
                key={item + index}
                draggableId={item}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style,
                    )}
                  >
                    {buildCard(item)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

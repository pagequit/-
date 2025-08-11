import { type Component } from "solid-js";
import {
  LassoIcon,
  LassoPolygonIcon,
  TransformPointIcon,
} from "#/devTools/icons/index.ts";

export const ObjectWindow: Component = () => {
  return (
    <div class="object-window">
      <button type="button" class="btn">
        <LassoIcon />
      </button>
      <button type="button" class="btn">
        <LassoPolygonIcon />
      </button>
      <button type="button" class="btn">
        <TransformPointIcon />
      </button>
    </div>
  );
};

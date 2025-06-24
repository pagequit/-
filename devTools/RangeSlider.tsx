import { type Component, type JSX } from "solid-js";

export const RangeSlider: Component<{
  name: string;
  min: number;
  max: number;
  step: number;
  value: number;
  children: JSX.Element;
  onChange?: (value: number) => void;
  onInput?: (value: number) => void;
}> = (props) => (
  <label class="range-slider">
    {props.children}
    <input
      type="range"
      name={props.name}
      min={props.min}
      max={props.max}
      step={props.step}
      value={props.value}
      onChange={(e) => props.onChange && props.onChange(e.target.valueAsNumber)}
      onInput={(e) => props.onInput && props.onInput(e.target.valueAsNumber)}
    />
  </label>
);

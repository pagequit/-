import { type Component, type JSX } from "solid-js";

export const InputField: Component<{
  name: string;
  type: string;
  value: number;
  children: JSX.Element;
  onChange?: (value: number) => void;
  onInput?: (value: number) => void;
}> = (props) => (
  <label class="input-field">
    {props.children}
    <input
      type={props.type}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange && props.onChange(e.target.valueAsNumber)}
      onInput={(e) => props.onInput && props.onInput(e.target.valueAsNumber)}
    />
  </label>
);

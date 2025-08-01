import { type Component, type JSX } from "solid-js";

export const InputField: Component<{
  name: string;
  type: string;
  value: string;
  children: JSX.Element;
  onChange?: (value: string) => void;
  onInput?: (value: string) => void;
}> = (props) => (
  <label class="input-field">
    {props.children}
    <input
      type={props.type}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
      onInput={(e) => props.onInput && props.onInput(e.target.value)}
    />
  </label>
);

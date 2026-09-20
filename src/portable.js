"use strict";

class PortableDataError extends Error {
  constructor(code, path, detail) {
    super(detail);
    this.name = "PortableDataError";
    this.code = code;
    this.path = path;
  }

  toHold() {
    return {
      code: this.code,
      path: this.path,
      detail: this.message
    };
  }
}

function nonportable(path, detail) {
  throw new PortableDataError("HOLD_FORM_INPUT_NONPORTABLE_VALUE", path, detail);
}

function clonePortableValue(value, path = "value", stack = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new PortableDataError(
        "HOLD_FORM_INPUT_NONFINITE_VALUE",
        path,
        "Form input contains a non-finite number that JSON transport would rewrite instead of preserve exactly."
      );
    }
    if (Object.is(value, -0)) {
      nonportable(path, "Form input contains -0, which JSON transport would rewrite to 0.");
    }
    return value;
  }

  if (value === undefined || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    nonportable(path, "Form input contains a value type that JSON transport would rewrite, drop, or reject.");
  }

  if (typeof value !== "object") {
    nonportable(path, "Form input contains an unsupported portable value.");
  }

  if (stack.has(value)) {
    nonportable(path, "Form input contains a cycle that JSON transport cannot represent.");
  }
  stack.add(value);

  try {
    if (Array.isArray(value)) {
      if (Object.getOwnPropertySymbols(value).length) {
        nonportable(path, "Form input contains symbol-keyed array properties that JSON transport would drop.");
      }

      const ownNames = Object.getOwnPropertyNames(value);
      const unexpected = ownNames.filter((name) => {
        if (name === "length") return false;
        if (!/^(0|[1-9][0-9]*)$/.test(name)) return true;
        return Number(name) >= value.length;
      });
      if (unexpected.length) {
        nonportable(path, "Form input contains array properties that JSON transport would not preserve: " + unexpected.sort().join(", "));
      }

      const out = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) {
          nonportable(path + "[" + index + "]", "Form input contains a sparse array slot that JSON transport would rewrite to null.");
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor || !("value" in descriptor)) {
          nonportable(path + "[" + index + "]", "Form input uses an accessor instead of portable authored data.");
        }
        if (!descriptor.enumerable) {
          nonportable(path + "[" + index + "]", "Form input contains a non-enumerable array item that JSON transport would not preserve as authored.");
        }
        out.push(clonePortableValue(descriptor.value, path + "[" + index + "]", stack));
      }
      return out;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      nonportable(path, "Form input uses a non-plain object that JSON transport would reinterpret.");
    }
    if (Object.getOwnPropertySymbols(value).length) {
      nonportable(path, "Form input contains symbol-keyed properties that JSON transport would drop.");
    }

    const descriptors = Object.getOwnPropertyDescriptors(value);
    const out = Object.create(null);
    for (const name of Object.getOwnPropertyNames(value)) {
      const descriptor = descriptors[name];
      if (!descriptor.enumerable) {
        nonportable(path + "." + name, "Form input contains a non-enumerable property that JSON transport would drop.");
      }
      if (!("value" in descriptor)) {
        nonportable(path + "." + name, "Form input uses an accessor instead of portable authored data.");
      }
      Object.defineProperty(out, name, {
        value: clonePortableValue(descriptor.value, path + "." + name, stack),
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    return out;
  } finally {
    stack.delete(value);
  }
}

function safeRequestId(request) {
  if (!request || typeof request !== "object" || Array.isArray(request)) return null;
  const descriptor = Object.getOwnPropertyDescriptor(request, "request_id");
  if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "string" || !descriptor.value) return null;
  return descriptor.value;
}

module.exports = { PortableDataError, clonePortableValue, safeRequestId };

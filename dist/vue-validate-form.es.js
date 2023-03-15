import { nanoid } from "nanoid";
const validators = {};
function register$1(name, validate2) {
  validators[name] = validate2;
}
const hasFieldValue = Symbol("hasFieldValue");
const getFieldValue = Symbol("getFieldValue");
const getFieldDefaultValue = Symbol("getFieldDefaultValue");
const getErrors = Symbol("getErrors");
const register = Symbol("register");
const validate = Symbol("validate");
const getIsSubmitted = Symbol("getIsSubmitted");
var symbols = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasFieldValue,
  getFieldValue,
  getFieldDefaultValue,
  getErrors,
  register,
  validate,
  getIsSubmitted
}, Symbol.toStringTag, { value: "Module" }));
function normalizeChildren(context, slotProps = null) {
  if (context.$scopedSlots.default) {
    return context.$scopedSlots.default(slotProps) || [];
  }
  return context.$slots.default || [];
}
function has(object, path) {
  if (!isObject(object)) {
    return false;
  }
  let pathParts = path.split(".");
  while (pathParts.length) {
    const key = pathParts.shift();
    if (!(key in object)) {
      return false;
    }
    object = object[key];
  }
  return true;
}
function get(object, path, defaultValue) {
  if (!isObject(object)) {
    return defaultValue;
  }
  let pathParts = path.split(".");
  while (pathParts.length && object) {
    const key = pathParts.shift();
    object = object[key];
  }
  return !pathParts.length ? object : defaultValue;
}
function set(object, path, value) {
  if (!isObject(object)) {
    return;
  }
  let pathParts = path.split(".");
  while (pathParts.length > 1) {
    const key = pathParts.shift();
    if (!isObject(object[key])) {
      object[key] = isIndex(pathParts[0]) ? [] : {};
    }
    object = object[key];
  }
  object[pathParts[0]] = value;
}
function isIndex(value) {
  const int = Number(value);
  return !Number.isNaN(int);
}
function isObject(value) {
  return !!value && typeof value == "object";
}
const ON_FIELD_CHANGE = "onFieldChange";
const ON_FORM_CHANGE = "onFormChange";
var ValidationProvider = {
  name: "ValidationProvider",
  provide() {
    return {
      [register]: this.register,
      [validate]: async (name) => {
        const { errors } = await this.validate(name);
        this.setErrorsList(errors);
      },
      [getFieldDefaultValue]: this.getFieldDefaultValue,
      [getFieldValue]: (name) => get(this.values, name),
      [getErrors]: this.getErrors,
      [hasFieldValue]: (name) => has(this.values, name),
      [getIsSubmitted]: () => this.submitted
    };
  },
  props: {
    defaultValues: {
      type: Object,
      default: () => ({})
    },
    defaultErrors: {
      type: Object,
      default: () => ({})
    },
    resolver: {
      type: Function,
      default: null
    },
    tag: {
      type: String,
      default: "div"
    }
  },
  data() {
    return {
      submitted: false,
      innerDefaultValues: {},
      fieldComponents: [],
      additionalErrors: {}
    };
  },
  computed: {
    fieldComponentMap() {
      return this.fieldComponents.reduce((map, fieldComponent) => {
        map[fieldComponent.name] = fieldComponent;
        return map;
      }, {});
    },
    values() {
      return this.fieldComponents.reduce((result, { name, getValue }) => {
        set(result, name, getValue());
        return result;
      }, {});
    },
    dirty() {
      return this.fieldComponents.some(({ dirty }) => dirty);
    },
    pristine() {
      return !this.fieldComponents.some(({ pristine }) => !pristine);
    },
    errors() {
      return this.fieldComponents.reduce((allErrors, { name, errors }) => {
        allErrors[name] = errors;
        return allErrors;
      }, Object.assign({}, this.additionalErrors));
    },
    existsErrors() {
      return Object.values(this.errors).some((errors) => errors.length);
    },
    firstInvalidFieldComponent() {
      return this.fieldComponents.find(({ name }) => this.errors[name].length);
    }
  },
  watch: {
    defaultValues: {
      immediate: true,
      handler: "setDefaultData"
    },
    defaultErrors: "setDefaultData",
    dirty: {
      immediate: true,
      handler(dirty) {
        this.$emit("dirty", dirty);
      }
    }
  },
  methods: {
    async setDefaultData() {
      this.reset(this.defaultValues);
      this.additionalErrors = {};
      if (!Object.values(this.defaultErrors).some((errors2) => errors2.length)) {
        return;
      }
      this.setErrorsList(this.defaultErrors, ON_FIELD_CHANGE);
      const { errors } = await this.validate();
      this.setErrorsList(errors);
      this.$nextTick(() => {
        this.submitted = true;
      });
    },
    getFieldDefaultValue(name, defaultValue) {
      return get(this.innerDefaultValues, name, defaultValue);
    },
    getErrors(name) {
      return name ? this.errors[name] || [] : this.errors;
    },
    async onSubmit() {
      this.submitted = true;
      this.additionalErrors = {};
      const { values, errors } = await this.validate();
      this.setErrorsList(errors);
      if (this.existsErrors) {
        return this.focusInvalidField();
      }
      this.$emit("submit", values, {
        setError: this.setError,
        reset: this.reset,
        onFieldChange: this.onFieldChange,
        focusInvalidField: this.focusInvalidField
      });
    },
    async validate(triggerFieldName = null) {
      const { values, errors } = await this.resolveSchema();
      const errorsList = this.getLegacyValidateErrors(errors);
      this.fieldComponents.forEach(({ resetErrors, errors: errors2, name }) => {
        if (triggerFieldName !== name) {
          const actualErrors = errors2.filter(
            ({ resetBehaviour }) => resetBehaviour !== ON_FORM_CHANGE
          );
          errorsList[name] = actualErrors.concat(errorsList[name] || []);
        }
        resetErrors();
      });
      return { values, errors: errorsList };
    },
    resolveSchema() {
      const values = this.values;
      return this.resolver ? this.resolver(values) : { values, errors: {} };
    },
    getLegacyValidateErrors(initialErrors = {}) {
      return this.fieldComponents.reduce((errorsList, { name, rules, getValue }) => {
        errorsList[name] = Object.entries(rules).reduce((errors, [ruleName, options]) => {
          const validator = validators[ruleName];
          if (!validator) {
            throw new Error(`validator '${ruleName}' must be registered`);
          }
          if (!validator(getValue(), options.params)) {
            errors.push({ message: options.message, type: ruleName });
          }
          return errors;
        }, errorsList[name] || []);
        return errorsList;
      }, initialErrors);
    },
    onFieldChange(name, value) {
      this.fieldComponentMap[name].onChange(value);
    },
    reset(values) {
      this.submitted = false;
      if (values) {
        this.innerDefaultValues = JSON.parse(JSON.stringify(values));
      }
      this.fieldComponents.forEach(({ reset }) => {
        reset();
      });
    },
    setErrorsList(errorsList, defaultResetBehaviour = ON_FORM_CHANGE) {
      Object.entries(errorsList).forEach(([name, errors]) => {
        errors.forEach(({ message, type, resetBehaviour = defaultResetBehaviour }) => {
          this.setErrorActual(name, { message, type, resetBehaviour });
        });
      });
    },
    setError(name, message, type = null, resetBehaviour = ON_FIELD_CHANGE) {
      this.setErrorActual(name, { message, type, resetBehaviour });
    },
    setErrorActual(name, { message, type = null, resetBehaviour = ON_FIELD_CHANGE }) {
      const fieldComponent = this.fieldComponentMap[name];
      if (fieldComponent) {
        fieldComponent.setErrorActual({ message, type, resetBehaviour });
        return;
      }
      if (this.additionalErrors[name] === void 0) {
        this.$set(this.additionalErrors, name, []);
      }
      this.additionalErrors[name].push({
        type,
        message,
        resetBehaviour
      });
    },
    focusInvalidField() {
      return this.firstInvalidFieldComponent && this.firstInvalidFieldComponent.onFocus();
    },
    register(fieldComponent) {
      const name = fieldComponent.name;
      this.fieldComponents.push(fieldComponent);
      (this.additionalErrors[name] || []).forEach((error) => {
        this.setErrorActual(name, error);
      });
      this.$delete(this.additionalErrors, name);
      return () => this.unregister(fieldComponent);
    },
    unregister(fieldComponent) {
      this.fieldComponents = this.fieldComponents.filter((field) => field !== fieldComponent);
    }
  },
  render(h) {
    const children = normalizeChildren(this, {
      handleSubmit: this.onSubmit,
      onFieldChange: this.onFieldChange,
      reset: this.reset,
      setError: this.setError,
      focusInvalidField: this.focusInvalidField,
      values: this.values,
      dirty: this.dirty,
      pristine: this.pristine,
      invalid: this.submitted && this.existsErrors,
      errors: this.errors
    });
    return children.length <= 1 ? children[0] : h(this.tag, children);
  }
};
var ValidationField = {
  name: "ValidationField",
  inject: {
    hasFieldValue,
    getFieldDefaultValue,
    getFieldValue,
    getIsSubmitted,
    register,
    validate
  },
  data() {
    return {
      registered: false,
      value: void 0,
      pristine: true,
      errors: []
    };
  },
  props: {
    name: {
      type: String,
      required: true
    },
    rules: {
      type: Object,
      default: () => ({})
    },
    isEqual: {
      type: Function,
      default: (a, b) => a === b
    },
    tag: {
      type: String,
      default: "div"
    }
  },
  computed: {
    defaultValue() {
      return this.getFieldDefaultValue(this.name);
    },
    hasProvidedValue() {
      return this.hasFieldValue(this.name);
    },
    providedValue() {
      return this.getFieldValue(this.name);
    },
    submitted() {
      return this.getIsSubmitted();
    },
    dirty() {
      return !this.isEqual(this.value, this.defaultValue);
    },
    firstError() {
      return this.errors[0];
    },
    invalid() {
      return this.submitted && !!this.errors.length;
    }
  },
  mounted() {
    this.value = this.hasProvidedValue ? this.providedValue : this.defaultValue;
    this.unregister = this.register(this);
    this.registered = true;
  },
  beforeDestroy() {
    this.unregister();
  },
  methods: {
    getValue() {
      return this.value;
    },
    onFocus() {
      this.$emit("should-focus", {
        name: this.name
      });
    },
    reset() {
      this.resetErrors();
      this.$nextTick(() => {
        this.onChange(this.defaultValue);
        this.pristine = true;
      });
    },
    onChange(value) {
      if (this.isEqual(this.value, value)) {
        return;
      }
      this.value = value;
      this.pristine = false;
      this.$emit("change", value);
      if (!this.submitted) {
        return;
      }
      this.validate(this.name);
    },
    setError(message, type = null, resetBehaviour = ON_FIELD_CHANGE) {
      this.setErrorActual({ message, type, resetBehaviour });
    },
    setErrorActual({ message, type = null, resetBehaviour = ON_FIELD_CHANGE }) {
      this.errors.push({
        type,
        message,
        resetBehaviour
      });
    },
    resetErrors() {
      if (this.errors.length) {
        this.errors = [];
      }
    }
  },
  render(h) {
    if (!this.registered) {
      return;
    }
    const children = normalizeChildren(this, {
      name: this.name,
      onChange: this.onChange,
      setError: this.setError,
      modelValue: this.value,
      errors: this.errors,
      firstError: this.firstError,
      dirty: this.dirty,
      invalid: this.invalid,
      pristine: this.pristine
    });
    return children.length <= 1 ? children[0] : h(this.tag, children);
  }
};
var ValidationFieldArray = {
  name: "ValidationFieldArray",
  inject: {
    register,
    getFieldDefaultValue,
    getFieldValue
  },
  provide() {
    return {
      [hasFieldValue]: (name) => {
        const normalizedName = name.replace(new RegExp(`^${this.name}.`), "");
        return has(this.actualValue, normalizedName) || has(this.fields, normalizedName);
      },
      [getFieldValue]: (name) => {
        const normalizedName = name.replace(new RegExp(`^${this.name}.`), "");
        return get(this.actualValue, normalizedName) || get(this.fields, normalizedName);
      },
      [register]: (fieldComponent) => {
        if (this.focusOptions) {
          const { focusName } = this.focusOptions;
          const { onFocus, name } = fieldComponent;
          if (name === focusName) {
            onFocus();
            this.focusOptions = null;
          }
        }
        return this.register(fieldComponent);
      }
    };
  },
  data() {
    return {
      fields: [],
      focusOptions: null,
      errors: [],
      rules: [],
      dirty: false,
      pristine: true
    };
  },
  props: {
    name: {
      type: String,
      required: true
    },
    keyName: {
      type: String,
      default: "id"
    },
    tag: {
      type: String,
      default: "div"
    }
  },
  computed: {
    defaultValue() {
      return this.getFieldDefaultValue(this.name) || [];
    },
    actualValue() {
      const keyName = this.keyName;
      const providedValues = this.getFieldValue(this.name) || [];
      return this.fields.map((field, index) => ({
        ...providedValues[index],
        [keyName]: field[keyName]
      }));
    }
  },
  mounted() {
    this.fields = [...this.defaultValue];
    this.unregister = this.register(this);
  },
  beforeDestroy() {
    this.unregister();
  },
  methods: {
    onChange(value) {
      this.fields = [...value];
    },
    getValue() {
      return [];
    },
    setErrorActual() {
    },
    resetErrors() {
    },
    reset() {
      this.fields = [...this.defaultValue];
    },
    append(value, focusOptions = null) {
      var _a;
      value[this.keyName] = (_a = value[this.keyName]) != null ? _a : nanoid();
      this.focusOptions = focusOptions;
      this.fields.push(value);
    },
    prepend(value, focusOptions = null) {
      var _a;
      value[this.keyName] = (_a = value[this.keyName]) != null ? _a : nanoid();
      this.focusOptions = focusOptions;
      this.fields.unshift(value);
    },
    insert(index, value, focusOptions = null) {
      var _a;
      value[this.keyName] = (_a = value[this.keyName]) != null ? _a : nanoid();
      this.focusOptions = focusOptions;
      this.fields.splice(index, 0, value);
    },
    swap(from, to) {
      const temp = this.fields[from];
      this.$set(this.fields, from, this.fields[to]);
      this.$set(this.fields, to, temp);
    },
    move(from, to) {
      this.fields.splice(to, 0, this.fields.splice(from, 1)[0]);
    },
    remove(index) {
      this.fields = this.fields.filter((field, i) => index !== i);
    }
  },
  render(h) {
    const children = normalizeChildren(this, {
      name: this.name,
      fields: this.actualValue,
      append: this.append,
      prepend: this.prepend,
      insert: this.insert,
      swap: this.swap,
      move: this.move,
      remove: this.remove
    });
    return children.length <= 1 ? children[0] : h(this.tag, children);
  }
};
var ValidationErrors = {
  name: "ValidationErrors",
  inject: {
    getErrors,
    getIsSubmitted
  },
  props: {
    name: {
      type: String,
      default: void 0
    },
    tag: {
      type: String,
      default: "div"
    }
  },
  computed: {
    submitted() {
      return this.getIsSubmitted();
    },
    errors() {
      const errors = this.getErrors(this.name);
      return Array.isArray(errors) ? errors : [].concat(...Object.values(errors));
    },
    invalid() {
      return this.submitted && !!this.errors.length;
    }
  },
  render(h) {
    if (!this.invalid) {
      return;
    }
    const children = normalizeChildren(this, {
      errors: this.errors
    });
    return children.length <= 1 ? children[0] : h(this.tag, children);
  }
};
export { ValidationErrors, ValidationField, ValidationFieldArray, ValidationProvider, register$1 as registerValidator, symbols };

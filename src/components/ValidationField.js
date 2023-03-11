import {
  getFieldDefaultValue,
  getFieldValue,
  hasFieldValue,
  getIsSubmitted,
  register,
  validate
} from './symbols';
import { normalizeChildren } from './helpers';
import { ON_FIELD_CHANGE } from './constants';

export default {
  name: 'ValidationField',
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
      value: undefined,
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
    tag: {
      type: String,
      default: 'div'
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
      return this.value !== this.defaultValue;
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
    this.unregister = this.register(this.fieldData);
  },
  beforeDestroy() {
    this.unregister();
  },
  methods: {
    fieldData() {
      return {
        name: this.name,
        value: this.value,
        dirty: this.dirty,
        errors: this.errors,
        rules: this.rules,
        focus: this.onFocus,
        reset: this.reset,
        setError: this.setError,
        resetErrors: this.resetErrors
      };
    },
    onFocus() {
      this.$emit('should-focus', {
        name: this.name
      });
    },
    reset() {
      this.resetErrors();
      this.$nextTick(() => {
        this.value = this.defaultValue;
      });
    },
    onChange(value) {
      this.value = value;

      if (!this.submitted) {
        return;
      }

      this.validate(this.name);
    },
    setError({ message, type = null, resetBehaviour = ON_FIELD_CHANGE }) {
      this.errors.push({
        type,
        message,
        resetBehaviour
      });
    },
    resetErrors() {
      this.errors = [];
    }
  },
  render(h) {
    const children = normalizeChildren(this, {
      name: this.name,
      onChange: this.onChange,
      setError: (message, type = null, resetBehaviour = ON_FIELD_CHANGE) => {
        this.setError({ message, type, resetBehaviour });
      },
      modelValue: this.value,
      errors: this.errors,
      firstError: this.firstError,
      dirty: this.dirty,
      invalid: this.invalid
    });

    return children.length <= 1 ? children[0] : h(this.tag, children);
  }
};

(function(a,o){typeof exports=="object"&&typeof module!="undefined"?o(exports,require("nanoid")):typeof define=="function"&&define.amd?define(["exports","nanoid"],o):(a=typeof globalThis!="undefined"?globalThis:a||self,o(a["vue-validate-form"]={},a.nanoid))})(this,function(a,o){"use strict";const V={};function O(e,t){V[e]=t}const d=Symbol("hasFieldValue"),h=Symbol("getFieldValue"),f=Symbol("getFieldDefaultValue"),v=Symbol("getErrors"),u=Symbol("register"),y=Symbol("validate"),c=Symbol("getIsSubmitted");var S=Object.freeze(Object.defineProperty({__proto__:null,hasFieldValue:d,getFieldValue:h,getFieldDefaultValue:f,getErrors:v,register:u,validate:y,getIsSubmitted:c},Symbol.toStringTag,{value:"Module"}));function m(e,t=null){return e.$scopedSlots.default?e.$scopedSlots.default(t)||[]:e.$slots.default||[]}function F(e,t){if(!p(e))return!1;let r=t.split(".");for(;r.length;){const s=r.shift();if(!(s in e))return!1;e=e[s]}return!0}function E(e,t,r){if(!p(e))return r;let s=t.split(".");for(;s.length&&e;){const i=s.shift();e=e[i]}return s.length?r:e}function k(e,t,r){if(!p(e))return;let s=t.split(".");for(;s.length>1;){const i=s.shift();p(e[i])||(e[i]=N(s[0])?[]:{}),e=e[i]}e[s[0]]=r}function N(e){const t=Number(e);return!Number.isNaN(t)}function p(e){return!!e&&typeof e=="object"}const D="onFieldChange",b="onFormChange";var $={name:"ValidationProvider",provide(){return{[u]:this.register,[y]:async e=>{if(this.validateField(e),!this.resolver)return;const{errors:t}=await this.resolver(this.values);Object.values(this.callbackDataMap).forEach(({resetErrors:r,errors:s,name:i})=>{const l=s.filter(({resetBehaviour:n})=>n!==b);t[i]=l.concat(t[i]||[]),r()}),Object.entries(t).forEach(([r,s])=>{s.forEach(({message:i,type:l,resetBehaviour:n=b})=>{this.setError(r,{message:i,type:l,resetBehaviour:n})})})},[f]:this.getFieldDefaultValue,[h]:e=>E(this.values,e),[v]:this.getErrors,[d]:e=>F(this.values,e),[c]:()=>this.submitted}},props:{defaultValues:{type:Object,default:()=>({})},resolver:{type:Function,default:null},tag:{type:String,default:"div"}},data(){return{submitted:!1,innerDefaultValues:{},callbacks:[],additionalErrors:{}}},computed:{callbackDataMap(){return this.callbacks.reduce((e,t)=>{const r=t();return e[r.name]=r,e},{})},values(){return Object.entries(this.callbackDataMap).reduce((e,[t,{value:r}])=>(k(e,t,r),e),{})},dirty(){return Object.values(this.callbackDataMap).some(({dirty:e})=>e)},errors(){return Object.values(this.callbackDataMap).reduce((e,{errors:t,name:r})=>(e[r]=t,e),Object.assign({},this.additionalErrors))},existsErrors(){return Object.values(this.errors).some(e=>e.length)},firstInvalidFieldData(){return Object.values(this.callbackDataMap).find(({name:e})=>this.errors[e].length)}},watch:{defaultValues:{immediate:!0,handler(e){this.reset(e)}},dirty:{immediate:!0,handler(e){this.$emit("dirty",e)}}},methods:{getFieldDefaultValue(e,t){return E(this.innerDefaultValues,e,t)},getErrors(e){return e?this.errors[e]||[]:this.errors},validateField(e){const{rules:t,value:r,setError:s,resetErrors:i}=this.callbackDataMap[e];i(),Object.entries(t).forEach(([l,n])=>{const g=V[l];if(!g)throw new Error(`validator '${l}' must be registered`);g(r,n.params)||s({message:n.message,type:l})})},async onSubmit(){this.submitted=!0;let e=this.values;if(this.additionalErrors={},Object.keys(this.callbackDataMap).forEach(t=>{this.validateField(t)}),this.resolver){const{values:t,errors:r}=await this.resolver(this.values);e=t,Object.entries(r).forEach(([s,i])=>{i.forEach(({message:l,type:n,resetBehaviour:g=b})=>{this.setError(s,{message:l,type:n,resetBehaviour:g})})})}if(this.existsErrors)return this.focusInvalidField();this.$emit("submit",e,{setError:(t,r,s=null,i=D)=>this.setError(t,{message:r,type:s,resetBehaviour:i}),reset:this.reset,focusInvalidField:this.focusInvalidField})},reset(e){this.submitted=!1,e&&(this.innerDefaultValues=JSON.parse(JSON.stringify(e))),Object.values(this.callbackDataMap).forEach(({reset:t})=>{t()})},setError(e,{message:t,type:r=null,resetBehaviour:s=D}){const i=this.callbackDataMap[e];if(i){i.setError({message:t,type:r,resetBehaviour:s});return}this.additionalErrors[e]===void 0&&this.$set(this.additionalErrors,e,[]),this.additionalErrors[e].push({type:r,message:t,resetBehaviour:s})},focusInvalidField(){return this.firstInvalidFieldData&&this.firstInvalidFieldData.focus()},register(e){const{name:t,setError:r}=e();return(this.additionalErrors[t]||[]).forEach(s=>{r(s)}),this.$delete(this.additionalErrors,t),this.callbacks.push(e),()=>this.unregister(e)},unregister(e){this.callbacks=this.callbacks.filter(t=>t!==e)}},render(e){const t=m(this,{handleSubmit:this.onSubmit,reset:this.reset,values:this.values,dirty:this.dirty,invalid:this.submitted&&this.existsErrors,errors:this.errors});return t.length<=1?t[0]:e(this.tag,t)}},I={name:"ValidationField",inject:{hasFieldValue:d,getFieldDefaultValue:f,getFieldValue:h,getIsSubmitted:c,register:u,validate:y},data(){return{value:void 0,errors:[]}},props:{name:{type:String,required:!0},rules:{type:Object,default:()=>({})},tag:{type:String,default:"div"}},computed:{defaultValue(){return this.getFieldDefaultValue(this.name)},hasProvidedValue(){return this.hasFieldValue(this.name)},providedValue(){return this.getFieldValue(this.name)},submitted(){return this.getIsSubmitted()},dirty(){return this.value!==this.defaultValue},firstError(){return this.errors[0]},invalid(){return this.submitted&&!!this.errors.length}},mounted(){this.value=this.hasProvidedValue?this.providedValue:this.defaultValue,this.unregister=this.register(this.fieldData)},beforeDestroy(){this.unregister()},methods:{fieldData(){return{name:this.name,value:this.value,dirty:this.dirty,errors:this.errors,rules:this.rules,focus:this.onFocus,reset:this.reset,setError:this.setError,resetErrors:this.resetErrors}},onFocus(){this.$emit("should-focus",{name:this.name})},reset(){this.resetErrors(),this.$nextTick(()=>{this.value=this.defaultValue})},onChange(e){this.value=e,this.submitted&&this.validate(this.name)},setError({message:e,type:t=null,resetBehaviour:r="onFieldChange"}){this.errors.push({type:t,message:e,resetBehaviour:r})},resetErrors(){this.errors=[]}},render(e){const t=m(this,{name:this.name,onChange:this.onChange,setError:(r,s=null,i="onFieldChange")=>{this.setError({message:r,type:s,resetBehaviour:i})},modelValue:this.value,errors:this.errors,firstError:this.firstError,dirty:this.dirty,invalid:this.invalid});return t.length<=1?t[0]:e(this.tag,t)}},M={name:"ValidationFieldArray",inject:{register:u,getFieldDefaultValue:f,getFieldValue:h},provide(){return{[d]:e=>F(this.fields,e.replace(new RegExp(`^${this.name}.`),"")),[h]:e=>E(this.fields,e.replace(new RegExp(`^${this.name}.`),"")),[u]:e=>{if(this.focusOptions){const{focusName:t}=this.focusOptions,{focus:r,name:s}=e();s===t&&(r(),this.focusOptions=null)}return this.register(e)}}},data(){return{fields:[],focusOptions:null}},props:{name:{type:String,required:!0},keyName:{type:String,default:"id"},tag:{type:String,default:"div"}},computed:{defaultValue(){return this.getFieldDefaultValue(this.name)||[]},actualValue(){const e=this.keyName,t=this.getFieldValue(this.name)||[];return this.fields.map((r,s)=>({...t[s],[e]:r[e]}))}},mounted(){this.fields=[...this.defaultValue],this.unregister=this.register(this.fieldData)},beforeDestroy(){this.unregister()},methods:{fieldData(){return{name:this.name,value:[],dirty:!1,errors:[],rules:{},focus:this.noop,reset:this.reset,setError:this.noop,resetErrors:this.noop}},noop(){},reset(){this.fields=[...this.defaultValue]},append(e,t=null){var r;e[this.keyName]=(r=e[this.keyName])!=null?r:o.nanoid(),this.focusOptions=t,this.fields.push(e)},prepend(e,t=null){var r;e[this.keyName]=(r=e[this.keyName])!=null?r:o.nanoid(),this.focusOptions=t,this.fields.unshift(e)},insert(e,t,r=null){var s;t[this.keyName]=(s=t[this.keyName])!=null?s:o.nanoid(),this.focusOptions=r,this.fields.splice(e,0,t)},swap(e,t){const r=this.fields[e];this.$set(this.fields,e,this.fields[t]),this.$set(this.fields,t,r)},move(e,t){this.fields.splice(t,0,this.fields.splice(e,1)[0])},remove(e){this.fields=this.fields.filter((t,r)=>e!==r)}},render(e){const t=m(this,{name:this.name,fields:this.actualValue,append:this.append,prepend:this.prepend,insert:this.insert,swap:this.swap,move:this.move,remove:this.remove});return t.length<=1?t[0]:e(this.tag,t)}},w={name:"ValidationErrors",inject:{getErrors:v,getIsSubmitted:c},props:{name:{type:String,default:void 0},tag:{type:String,default:"div"}},computed:{submitted(){return this.getIsSubmitted()},errors(){const e=this.getErrors(this.name);return Array.isArray(e)?e:[].concat(...Object.values(e))},invalid(){return this.submitted&&!!this.errors.length}},render(e){if(!this.invalid)return;const t=m(this,{errors:this.errors});return t.length<=1?t[0]:e(this.tag,t)}};a.ValidationErrors=w,a.ValidationField=I,a.ValidationFieldArray=M,a.ValidationProvider=$,a.registerValidator=O,a.symbols=S,Object.defineProperties(a,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});

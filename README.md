
# woog

- simple wrapper of @openapitools/openapi-generator-cli, with some default configurations.
- woog means Wrapper Of Openapi Generator 
- if use generator `openapi` or `openapi-yaml`, paths and schemas in input file will be sorted

## Install

```bash
npm i -g @openapitools/openapi-generator-cli woog
```

## Usage
```bash
woog <generatorDirName> [inputFileName=openapi] [outputDirName=out]
```
example:
```bash
woog openapi
```
```bash
woog html2 openapi.json out.html2
```

## Config
if config file exists(`<generatorDir>/config.yaml` or `<generatorDir>/config.yml` or `<generatorDir>/config.json`) 
generator will use it

you can put optional extra parameters in the config file:
- x-generator
    
    if the `generatorDir` is not the same as generator name, you can set generator name with this parameter.
    eg: the `generatorDir` is `java-spring-code` and the generator name is `spring`

- x-template
  
    if you want to use custom templates, set your template root dir to env `OPENAPI_TEMPLATE_ROOT`, and add
    parameter `x-template` to config file.

    * `true` means use `OPENAPI_TEMPLATE_ROOT`/`generatorName` as template dir
    * string value means use `OPENAPI_TEMPLATE_ROOT`/`<x-template value>` as template dir
    * some generators have special template dir name(different from generator name). 
      these generators' template dir will be auto mapped if `x-template` have been set to `true`. for example: 
      1. `html2` -> `htmlDocs2`
      2. `spring` -> `JavaSpring`
      3. `jaxrs-cxf` -> `JavaJaxRS`
      4. `jaxrs-cxf-cdi` -> `JavaJaxRS`
## Note
- use `openapi-generator-cli version-manager` to switch openapi-generator-cli version
- use `openapi-generator-cli list` to get available generator names
- use `openapi-generator-cli config-help -g <generatorName>` to get generator config schema  

## License

MIT &copy; [rainmanhhh](https://github.com/rainmanhhh)

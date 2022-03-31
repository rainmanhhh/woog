/**
 * key - generator name(openapi cli -g param);
 * value - template dir name(child of openapi-generator/modules/openapi-generator/src/main/resources)
 */
export const templateMap: Record<string, string> = {
  /**
   * CLIENT
   */
  'ada': 'Ada',
  'c': 'C-libcurl',
  'cpp-restsdk': 'cpp-rest-sdk-client',
  'cpp-tizen': 'cpp-tizen-client',
  'eiffel': 'Eiffel',
  'groovy': 'Groovy',
  'java': 'Java',
  'javascript': 'Javascript',
  'javascript-apollo': 'Javascript-Apollo',
  'javascript-closure-angular': 'Javascript-Closure-Angular',
  'javascript-flowtyped': 'Javascript-Flowtyped',
  'jaxrs-cxf-client': 'JavaJaxRS',
  'jmeter': 'jmeter-client',
  'kotlin': 'kotlin-client',
  'nim': 'nim-client',
  'ruby': 'ruby-client',
  'scala-akka': 'scala-akka-client',
  /**
   * SERVER
   */
  'ada-server': 'Ada',
  'fsharp-functions': 'fsharp-functions-server',
  'haskell': 'haskell-servant',
  'java-inflector': 'JavaInflector',
  'java-msf4j': 'java-msf4j-server',
  'java-play-framework': 'JavaPlayFramework',
  'java-vertx': 'JavaVertXServer',
  'java-vertx-web': 'JavaVertXWebServer',
  'jaxrs-cxf': 'JavaJaxRS',
  'jaxrs-cxf-cdi': 'JavaJaxRS',
  'jaxrs-cxf-extended': 'JavaJaxRS',
  'jaxrs-jersey': 'JavaJaxRS',
  'jaxrs-resteasy': 'JavaJaxRS',
  'jaxrs-resteasy-eap': 'JavaJaxRS',
  'jaxrs-spec': 'JavaJaxRS',
  'kotlin-vertx': 'kotlin-vertx-server',
  'php-slim4': 'php-slim4-server',
  'ruby-on-rails': 'ruby-on-rails-server',
  'ruby-sinatra': 'ruby-sinatra-server',
  'spring': 'JavaSpring',
  /**
   * DOCUMENTATION
   */
  'asciidoc': 'asciidoc-documentation',
  //cwiki
  //dynamic-html
  'html': 'htmlDocs',
  'html2': 'htmlDocs2',
  'markdown': 'markdown-documentation',
  /**
   * SCHEMA
   */
  /**
   * CONFIG
   */
}

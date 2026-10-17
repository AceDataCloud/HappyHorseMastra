import { ServiceToolProvider, type ProviderOptions } from './provider.js';
export { AceToolError } from './provider.js';
export type { ProviderOptions as HappyHorseToolProviderOptions } from './provider.js';

/** HappyHorse tools through Ace Data Cloud, independently installable in Mastra. */
export class HappyHorseToolProvider extends ServiceToolProvider {
  constructor(options: ProviderOptions = {}) {
    super({
      slug: 'happyhorse',
      name: 'HappyHorse by Ace Data Cloud',
      description: 'HappyHorse video generation, image-to-video, reference-to-video, video editing, and same-task result queries.',
      endpoint: 'https://happyhorse.mcp.acedata.cloud/mcp',
      packageName: '@acedatacloud/mastra-happyhorse',
    }, options);
  }
}

import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'
import {
  ProductLandingPageTemplate,
  ProductLandingPageTemplateCreate,
  ProductLandingPageTemplateUpdate,
} from '../../core/entities/product_landing_page_template.js'

/**
 * Represents a repository for managing product landing page templates.
 */
export class ProductLandingPageTemplatesRepository extends ModelRepository<
  ProductLandingPageTemplate,
  ProductLandingPageTemplateCreate,
  ProductLandingPageTemplateUpdate
> {
  /**
   * Creates a new instance of ProductLandingPageTemplatesRepository class.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('product_landing_page_templates', client)
  }
}

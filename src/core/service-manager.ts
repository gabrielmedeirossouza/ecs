export interface Service {
  readonly name: string
}

export class ServiceManager {
  private services: Map<string, Service> = new Map()

  provide(...services: Service[]) {
    for (const service of services) {
      this.services.set(service.name, service)
    }
  }

  get<T extends abstract new (...args: any[]) => any>(Service: T): InstanceType<T> {
    const service = this.services.get(Service.name)
    if (!service)
      throw new Error(`[ServiceMissing] Service "${Service.name}" not provided!`)

    return service as InstanceType<T>
  }
}
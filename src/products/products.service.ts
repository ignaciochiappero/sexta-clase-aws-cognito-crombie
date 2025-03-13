//src\products\products.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    
  ) {}

  async create(createProductDto: CreateProductDto) {
    return await this.prisma.product.create({ data: createProductDto });
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: number, updateProductDto: UpdateProductDto) {
    
    const existingProduct = this.prisma.product.findUnique({
      where: { id },
    });
    
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if (!existingProduct) {
      throw new NotFoundException (`Producto con id ${id} no encontrado`);
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    
    });


    
    return updatedProduct;
   

  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}

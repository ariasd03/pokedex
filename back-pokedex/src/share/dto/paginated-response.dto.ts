import { ApiProperty } from "@nestjs/swagger";


export class PaginatedResponseDto <T> {

@ApiProperty({description: "info del campo"})
data: T[];

@ApiProperty({description: "info del campo"})
total: number;

@ApiProperty({description: "info del campo"})
page:  number;

@ApiProperty({description: "info del campo"})
totalPages: number;

@ApiProperty({description: "info del campo"})
hasNextPage: boolean;

@ApiProperty({description: "info del campo"})
hasPreviousPage: boolean;

}
import { Transform, Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class PrismaqueryParamsDto {

    @IsOptional()
    @Type()
    skip?: number;

    @IsOptional()
    @Type()
    take?: number;

    @IsOptional()
    @Transform(({value}) => {
        if (typeof value === 'object'){
            return value;
        }
        try {
            return JSON.parse(value);
        } catch (error) {
            return undefined;
        }
    })
    orderBy?: Record<string, any>;


    @IsOptional()
    where?: Record<string, any>;
}
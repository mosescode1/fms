import {Response, Request, NextFunction} from "express";
import OrganizationService from "../../../service/v1/organization/organization.service";
import {AppError} from "../../../lib";
import reqValidator from "../../../lib/reqValidator";



class OrganizationController {

    async createOrganization(req: Request, res: Response, next: NextFunction): Promise<any> {
        const required = reqValidator(req, ["name", "email", "phoneNumber"]);
        if (!required.status) {
            throw new AppError({message: required.message, statusCode: 400});
        }

        const organization = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
        };

        try {
            await OrganizationService.createOrganization(organization);
        } catch (err: any) {
            throw new AppError({message: err.message, statusCode: 500});
        }

        res.status(201).json({message: "Organization created successfully"});
    }
}





const organizationController = new OrganizationController();
export default organizationController;
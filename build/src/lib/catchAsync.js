"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = void 0;
const catchAsync = (fn) => {
    return (request, response, next) => {
        return fn(request, response, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
//# sourceMappingURL=catchAsync.js.map
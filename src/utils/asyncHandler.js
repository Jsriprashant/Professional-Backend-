
// promise method

const asyncHandler = (requestHandler) => {
    async (res,req,next)=>{
        Promise.resolve(requestHandler(res,req,next)).catch((error)=>next(error))
    }

}
export default asyncHandler


// // try catch method

//  const asyncHandler = (fn) => {
//     async (res, req, next) => {
//         try {
//             await fn(res, req, next)
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 Sucess: false,
//                 Message: error.message
//             })
//         }

//     }
// }

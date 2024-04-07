const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};


export {asyncHandler};




























// Secound Approch
// const asyncHandeler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next);
//     } catch (err) {
//         res.send(err.code||500,{
//             success:false,
//             massage:err.massage
//         })
//     }
// };

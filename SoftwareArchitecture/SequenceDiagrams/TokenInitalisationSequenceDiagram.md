### Token Initialisation Sequence Diagram

1. User opens `Data Storage System`; Creates new token and copies it (optionally QR code is displayed)
   No data permissions yet!
2. User opens new app and pastes the token
3. App can now send permission request(s) to Data Storage System and specifies what data events it wants to access and what operations for each of them (`READ`, `WRITE`, `UPDATE`, `DELETE`). App can also send information about what the app is about so that user can already see that when approving a token.
4. User now needs to open `Data Storage System` where they will see notification about the need of approving new permission requests. If the app attached the app's further information (such as title, brief description or logo) the user is able to see this in `Data Storage System`
5. User approves the permission
6. App is now fully functional and prepared for what is was prepared for
7. User can open `Data Storage System` and cancel that permission at any later point
8. App `A` can give permission to other app `B` to some events without `Data Storage System`'s need to approve it
9. User can see the cross-app peermissions in `Data Storage System` (when they open app `A` details, they see which data is being shared to other app by app `A` without explicit request by app `B`)
10. If the user revokes permissions to app `A`, it needs to be transitively cancelled to app `B` as well
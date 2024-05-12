export type Solchat = {
  version: "0.1.0";
  name: "solchat";
  instructions: [
    {
      name: "createUser";
      accounts: [
        {
          name: "userAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "username";
          type: "string";
        },
        {
          name: "avatarUrl";
          type: "string";
        }
      ];
    },
    {
      name: "createMsg";
      accounts: [
        {
          name: "msgAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "toAddress";
          type: "string";
        },
        {
          name: "data";
          type: "string";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "userAccount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "username";
            type: "string";
          },
          {
            name: "avatarUrl";
            type: "string";
          },
          {
            name: "userAddress";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "msgAccount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "fromAddress";
            type: "string";
          },
          {
            name: "toAddress";
            type: "string";
          },
          {
            name: "data";
            type: "string";
          },
          {
            name: "time";
            type: "i64";
          }
        ];
      };
    }
  ];
};

export const IDL: Solchat = {
  version: "0.1.0",
  name: "solchat",
  instructions: [
    {
      name: "createUser",
      accounts: [
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "username",
          type: "string",
        },
        {
          name: "avatarUrl",
          type: "string",
        },
      ],
    },
    {
      name: "createMsg",
      accounts: [
        {
          name: "msgAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "toAddress",
          type: "string",
        },
        {
          name: "data",
          type: "string",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "userAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "username",
            type: "string",
          },
          {
            name: "avatarUrl",
            type: "string",
          },
          {
            name: "userAddress",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "msgAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "fromAddress",
            type: "string",
          },
          {
            name: "toAddress",
            type: "string",
          },
          {
            name: "data",
            type: "string",
          },
          {
            name: "time",
            type: "i64",
          },
        ],
      },
    },
  ],
};

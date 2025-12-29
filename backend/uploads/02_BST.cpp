
#include<bits/stdc++.h>
using namespace std;

class Node{
  public :
    int data;
    Node* left;    
    Node* right;

    Node(int val){
      this->data = val;
      left = NULL;
      right = NULL;
    }    
};

Node* buildBST(int val, Node*&root){
  if(root == NULL){
    root = new Node(val);
    return root;
  }
  else{
    if(root->data > val){
      //val -> left subtree
      root->left = buildBST(val,root->left);
    }
    else{
      //val -> right subtree
      root->right = buildBST(val,root->right);
    }
  }
  return root;

  //* T.C. : O(logN) *//
} 

void createTree(Node*&root){
  cout << "Enter the value for Node : " << endl;
  int val;
  cin >> val;

  while(val!=-1){
    root = buildBST(val,root);
    cout << "Enter the value for node : " << endl;
    cin >> val;
  }
}

void levelOrderTraversal(Node*&root){
  queue<Node*>q;
  q.push(root);
  q.push(NULL);

  while(!q.empty()){
    Node* front = q.front();
    q.pop();
    if(front==NULL){
      cout << endl;
      if(!q.empty()){
        q.push(NULL);
      }
    }
    else{
      cout << front->data << " ";

      if(front->left){
        q.push(front->left);
      }
      if(front->right){
        q.push(front->right);
      }
    }
  }
}

void preorderTraversal(Node*&root){
  if(root == NULL){
    return;
  }

  //NLR
  cout << root->data << " ";
  preorderTraversal(root->left);
  preorderTraversal(root->right);
}

void inorderTraversal(Node*&root){
  if(root == NULL){
    return;
  }

  //LNR
  inorderTraversal(root->left);
  cout << root->data << " ";
  inorderTraversal(root->right);

  // NOTE : Always sorted //

}

void postorderTraversal(Node*&root){
  if(root == NULL){
    return;
  }

  //LNR
  postorderTraversal(root->left);
  postorderTraversal(root->right);
  cout << root->data << " ";
}

//* Max & Min Of BST *//
int getMin(Node* root){
  if(root == NULL){
    return -1;
  }
  while(root->left != NULL){
    root = root->left;
  }
  return root->data;
}

int getMax(Node* root){
  if(root == NULL){
    return -1;
  }
  while(root->right != NULL){
    root = root->right;
  }
  return root->data;
}

//* Search in BST *//
bool searchBST(Node*&root,int target){
  if(root==NULL){
    return false;
  }
  if(root->data == target){
    return true;
  }
  else{
    // data != target
    //decide left or right

    if(target < root->data){
      //left
      bool leftAns = searchBST(root->left,target);
      if(leftAns==true) return true;
    }
    else{
      //right
      bool rightAns = searchBST(root->right,target);
      if(rightAns==true)return true;
    }
  }
  return false;
}

//* Delete a node form BST *//
//Case 1 : Node to be deleted has 2 child
//Case 2 : Node to be deleted has no child
//Case 3 : Node to be deleted has left child only
//Case 4 : Node to be deleted has right child only

Node* deleteNodeFromBST(Node*&root,int target){
  if(root == NULL){
    return NULL;
  }

  if(root->data == target){
    //match
    //ab mujhe node delte krni hai saare 4 cases ko consider krke

    //1. 
    if(root->left==NULL&&root->right==NULL){
      delete root;
      return NULL;
    }
    //2.
    if(root->left!=NULL&&root->right==NULL){
      Node* leftChild = root->left;
      root->left = NULL;
      delete root;
      return leftChild;
    }
    //3.
    if(root->left==NULL&&root->right!=NULL){
      Node* rightChild = root->right;
      root->right = NULL;
      delete root;
      return rightChild;
    }
    //4.
    if(root->left!=NULL&&root->right!=NULL){
      //root se just chote se replace kro ya jusr bada
      //jisse bhi delete kiya us node ko delete bhi krdo
      int maxValue = getMax(root->left);
      //replace root node value with this maxValue
      root->data = maxValue;
      //delete actual node of maxValue
      root->left = deleteNodeFromBST(root->left,maxValue);
      return root;
    }
    
  }

  else{
    //not match
    //left ya right jao
    if(target < root->data){
      //left jao
      root->left = deleteNodeFromBST(root->left,target);
    }
    else{
      //right jao
      root->right = deleteNodeFromBST(root->right,target);
    }
  }
  return root;
}

//* Two Sum IV - Input is a BST *//
// given the root of a BST and an integer k, 
// return true if there exsist two elements in the BST such that thir sum is equal to k, 
// or false otherwise

void storeInorder(Node*&root,vector<int>&inorder){
  if(root==NULL){
    return;
  }
  //LNR
  storeInorder(root->left,inorder);
  inorder.push_back(root->data);
  storeInorder(root->right,inorder);
}
bool checkTwoSum(vector<int>&inorder,int k){
  int n = inorder.size();
  int s = 0;
  int e = n-1;
  while(s<e){
    int sum = inorder[s] + inorder[e];

    if(sum == k){
      return true;
    }
    if(sum > k){
      e--;
    }
    if(sum < k){
      s++;
    }
  }
  return false;
}
bool findTarget(Node*&root, int k){
  vector<int>inorder;
  storeInorder(root,inorder);
  bool ans = checkTwoSum(inorder,k);
  return ans;
}

//* Binary Search Tree to Greater Sum Tree *//
void updateTree(Node*&root,vector<int>&inorder,int&index){
  if(root == NULL){
    return;
  }
  //LNR
  updateTree(root->left,inorder,index);
  root->data = inorder[index];
  index++;
  updateTree(root->right,inorder,index);
}
Node* bstToGst(Node*&root){
  if(root==NULL) return NULL;
  if(root->left==NULL && root->right==NULL) return root;

  //Step 1 : Store inorder
  vector<int>inorder;
  storeInorder(root,inorder);

  //Step 2 : Update inorder
  int n = inorder.size();
  for(int i=n-1;i>=0;i--){
    int currVal = inorder[i];
    int nextVal = 0;

    if(i+1 < n){
      nextVal = inorder[i+1];
    }
    int sum = currVal + nextVal;
    //repalce krrhe hai
    inorder[i] = sum;
  }

  //Step 3 : Update tree using inorder
  int index = 0;
  updateTree(root,inorder,index);

  return root;

}

//* Kth Smallest Element in a BST *//
void kthSmallest_helper(Node*&root, int k, int&count,Node*&ans){
  if(root == NULL){
    return;
  }
  //LNR

  //L
  kthSmallest_helper(root->left,k,count,ans);
  //N
  count++;
  if(count==k){
    ans = root;
  }
  kthSmallest_helper(root->right,k,count,ans);

}
int kthSmallest(Node*&root,int k){
  //* Method 1 *//
  //store inorder -> k-1 wale ko return kro
  // vector<int>inorder;
  // storeInorder(root,inorder);
  // return inorder[k-1];

  //* Method 2 *//
  int count = 0;
  Node* ans = NULL;
  kthSmallest_helper(root,k,count,ans);
  return ans->data;

}

//* Lowest Common Ancestor of a BST *//
Node* lowestCommonAncestor(Node*&root,Node*&p,Node*&q){
  //*MEthod 1 *//
  // if(root == NULL) return NULL;
  // if(root->data == p->data) return p;
  // if(root->data == q->data) return q;

  // Node* left = lowestCommonAncestor(root->left,p,q);
  // Node* right = lowestCommonAncestor(root->right,p,q);
  
  // //4 Cases 
  // if(left==NULL && right == NULL){
  //   return NULL;
  // }
  // else if(left!=NULL && right == NULL){
  //   return left;
  // }
  // else if(left==NULL && right!=NULL){
  //   return right;
  // }
  // else{
  //   return root;
  // }

  //*Method 2 *//
  //Cases : 
  // 1. p,q in right subtree
  // 2. p,q in left subtree
  // 3. p,q alag alag subtree mein -> return root

  if(root==NULL) return NULL;

  //1
  //right -> neglect and left ->  select
  if(p->data < root->data && q->data < root->data){
    Node* leftAns = lowestCommonAncestor(root->left,p,q);
    if(leftAns!=NULL) return leftAns;
  }

  //2
  if(p->data > root->data && q->data > root->data){
    Node* rightAns = lowestCommonAncestor(root->right,p,q);
    if(rightAns!=NULL) return rightAns;
  }

  //3
  return root;

}

//* Create a height balanced BST using inorder traversal (Sorted array) only *//
//* Convert Sorted array to height balanced BST *//
Node* sortedArrayToBST_helper(vector<int>inorder,int s,int e){
  if(s>e)return NULL;

  //1 case solve krdeta hu
  int mid = (s+e)/2;
  int element = inorder[mid];
  Node* root = new Node(element);

  //baaki recursion smabhal lega
  root->left = sortedArrayToBST_helper(inorder,s,mid-1);
  root->right = sortedArrayToBST_helper(inorder,mid+1,e);
  return root;
}
Node* sortedArrayToBST(vector<int>&inorder){
  int s = 0;
  int n = inorder.size();
  int e = n-1;
  Node* root = sortedArrayToBST_helper(inorder,s,e);

  return root;
}

//* Convert Sorted List to Binary Search Tree *//
// Definition for singly-linked list.
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
// Definition for a binary tree node.
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

int getLength(ListNode*&head){
  ListNode* temp = head;
  int cnt = 0;
  while(temp!=NULL){
    cnt++;
    temp = temp->next;
  }
  return cnt;
}

TreeNode* sortedListToBST_helper(ListNode*&head,int n){
  if(head==NULL || n<=0){
    return NULL;
  }
  //LNR
  //L
  TreeNode* leftSubTree = sortedListToBST_helper(head,n/2);
  //N
  //ab head mid-node pe khada hoga
  TreeNode* root = new TreeNode(head->val);
  root->left = leftSubTree;
  //ab head mid pr khada tha->usko aage bhejo
  head = head->next;
  //ab head right part of ll k start pr khada hoga
  TreeNode* rightSubTree = sortedListToBST_helper(head,n-n/2-1);
  root->right = rightSubTree;
  return root;
}
TreeNode* sortedListToBST(ListNode* head){
  int n = getLength(head);
  TreeNode* root =  sortedListToBST_helper(head,n);
  return root;
}

//* Maximum sum BST in a Binary Tree *//

class Info{
  public:
    int minVal;
    int maxVal;
    int sum;
    bool isBST;
};


Info maxSumBST_helper(Node*&root, int&sum){
  // base case
  if(root == NULL){
    Info temp;
    temp.minVal = INT_MAX;
    temp.maxVal = INT_MIN;
    temp.sum = 0;
    temp.isBST = true;
    sum = max(sum,temp.sum);
    return temp;
  }

  if(root->left==NULL&&root->right==NULL){
    Info temp;
    temp.minVal = root->data;
    temp.maxVal = root->data;
    temp.sum = root->data;
    temp.isBST = true;
    sum = max(sum,temp.sum);
    return temp; 
  }

  //LRN
  Info leftAns = maxSumBST_helper(root->left,sum);
  Info rightAns = maxSumBST_helper(root->right,sum);

  //N
  Info currentAns;
  currentAns.minVal = min(leftAns.minVal,min(rightAns.minVal,root->data));
  currentAns.maxVal = max(leftAns.maxVal,max(rightAns.maxVal,root->data));
  currentAns.sum = leftAns.sum + rightAns.sum + root->data;
  currentAns.isBST = (root->data>leftAns.maxVal && root->data < rightAns.minVal && leftAns.isBST && rightAns.isBST);

  // jab bhi BST milega tabhi uska sum update karalunga
  // is tarreke se mere paas max sum aajega
  if(currentAns.isBST){
    sum = max(sum,currentAns.sum);
  }
  return currentAns;

}

int maxSumBST(Node*&root){
  int sum = 0;
  Info temp = maxSumBST_helper(root,sum);
  return sum;
}



int main()
{



  cout << endl; 
  return 0;
}
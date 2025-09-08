# vibe coding is WIP, do not use this yet :) 


# DevOps Wiki Better

if you have ever tried to use https://yourcompany.visualstudio.com/YourProject/_wiki/wikis/YourProject.wiki/ on azure for any real project, you will be familiar with this completely broken feature:

<img width="744" height="380" alt="image" src="https://github.com/user-attachments/assets/e3f1255f-8538-42af-8ffc-00bc245d349e" />

I do not know who programmed this, but it somehow has a runtime of `O(n!)`, where `n` is the number of pages.

## Other bugs in the webui that are unacceptable:

- If the `.order` file is incomplete, the web frontend refuses to let users reorder items in the folder until somebody uses git to push a fixed version where the file is either delete or completed. 

To solve these unacceptable bugs and allow me to work with this wiki, I will vibe code a lighweight frontend for it in this repo, clone the azure wiki to a local folder and work with that.

In the meantime, you can also just use your text editor, common sense and git and then finish by proof-reading the result on the microsoft web ui for the wiki.


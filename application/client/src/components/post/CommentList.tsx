import { CommentItem } from "@web-speed-hackathon-2026/client/src/components/post/CommentItem";
import { IntersectionRender } from "@web-speed-hackathon-2026/client/src/components/foundation/IntersectionRender";

interface Props {
  comments: Models.Comment[];
}

export const CommentList = ({ comments }: Props) => {
  return (
    <div>
      {comments.map((comment, index) => {
        if (index < 3) {
          return <CommentItem key={comment.id} comment={comment} />;
        }
        return (
          <IntersectionRender key={comment.id} height="80px">
            <CommentItem comment={comment} />
          </IntersectionRender>
        );
      })}
    </div>
  );
};

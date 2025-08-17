-- Fix the security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agents
  SET rating = (
    SELECT COALESCE(AVG(rating)::numeric, 0)
    FROM agent_reviews
    WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
  )
  WHERE id = COALESCE(NEW.agent_id, OLD.agent_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;